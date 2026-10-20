// Gemma inference layer — one interface, three paths.
//
// Black Box's open-innovation claim, stated honestly:
//  - LOCAL (default, private): Gemma 4 runs on the user's own machine via
//    Ollama. Inference text never leaves the device.
//  - HOSTED (live-demo path): the same Gemma 4 weights served by a hosted
//    OpenAI-compatible endpoint (e.g. OpenRouter). Text IS sent to that
//    provider. The UI labels this "Demo mode" wherever it is active —
//    we never claim local privacy for a hosted call.
//  - MOCK: deterministic local stub for development and CI. Returns a
//    clearly-labelled placeholder so the app can be built and tested
//    with no model present.
//
// Selection is by env: GEMMA_PROVIDER=local|hosted|mock (default local).

export type GemmaProviderKind = "local" | "hosted" | "mock";

export interface GemmaConfig {
  kind: GemmaProviderKind;
  model: string;
  baseUrl: string;
  apiKey?: string;
}

export function getGemmaConfig(
  override?: GemmaProviderKind,
): GemmaConfig {
  const kind =
    override ?? ((process.env.GEMMA_PROVIDER ?? "local") as GemmaProviderKind);
  if (kind === "hosted") {
    return {
      kind,
      model: process.env.GEMMA_HOSTED_MODEL ?? "google/gemma-4-31b-it:free",
      baseUrl:
        process.env.GEMMA_HOSTED_BASE_URL ?? "https://openrouter.ai/api/v1",
      apiKey: process.env.GEMMA_HOSTED_API_KEY,
    };
  }
  if (kind === "mock") {
    return { kind, model: "mock", baseUrl: "" };
  }
  return {
    kind: "local",
    model: process.env.OLLAMA_MODEL ?? "gemma4:e4b",
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  };
}

/** Call Gemma with a system + user prompt and return the raw text reply. */
export async function callGemma(
  system: string,
  user: string,
  config: GemmaConfig = getGemmaConfig(),
): Promise<string> {
  if (config.kind === "mock") return mockReply(user);

  if (config.kind === "local") {
    // Ollama native chat API.
    const res = await fetch(`${config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(
        `Local Gemma (Ollama) request failed: ${res.status}. Is Ollama running with model ${config.model} pulled?`,
      );
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content ?? "";
  }

  // Hosted: OpenAI-compatible chat completions.
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`Hosted Gemma request failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Parse a model reply as JSON, tolerating stray markdown fences. */
export function parseModelJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned) as T;
}

function mockReply(user: string): string {
  // The mock exists so the build is verifiable without a model. It echoes
  // structure, not insight — and says so in the payload itself.
  if (user.includes("SCORE_REQUEST")) {
    return JSON.stringify({
      score: 5,
      reasons: [
        "Mock provider: no model was called, so this score is a placeholder.",
        "Set GEMMA_PROVIDER=local with Ollama running to get a real score.",
      ],
    });
  }
  return JSON.stringify({
    reframed:
      "Mock provider: no model was called. This placeholder preserves the shape of a real reframe so the interface can be tested end to end.",
    decision: "No decision is stated in this message.",
    known: ["Mock mode is active; the text was not analysed."],
    unknown: ["Everything a real Gemma call would extract."],
    nextStep: "Set GEMMA_PROVIDER=local and pull gemma4:e4b in Ollama.",
  });
}
