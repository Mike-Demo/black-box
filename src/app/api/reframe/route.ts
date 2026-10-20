import { NextRequest, NextResponse } from "next/server";
import { callGemma, getGemmaConfig, parseModelJson } from "@/lib/gemma";
import { REFRAME_SYSTEM_PROMPT } from "@/lib/prompts";
import type { ReframeResult } from "@/lib/types";

// POST /api/reframe  { "text": "...", "provider"?: "local" | "hosted" }
// Returns the original text verbatim alongside a labelled, fact-preserving
// reframe produced by Gemma. This route is stateless: nothing is stored.
export async function POST(req: NextRequest) {
  let text: string;
  let providerOverride: "local" | "hosted" | undefined;
  try {
    const body = (await req.json()) as {
      text?: unknown;
      provider?: unknown;
    };
    if (typeof body.text !== "string" || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Body must include a non-empty 'text' string." },
        { status: 400 },
      );
    }
    text = body.text;
    if (body.provider === "local" || body.provider === "hosted") {
      providerOverride = body.provider;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Mock mode is a server-side dev setting; client overrides never enable it.
  const serverKind = process.env.GEMMA_PROVIDER ?? "local";
  const config =
    serverKind === "mock"
      ? getGemmaConfig("mock")
      : getGemmaConfig(providerOverride);
  try {
    const raw = await callGemma(REFRAME_SYSTEM_PROMPT, text, config);
    const parsed = parseModelJson<{
      reframed: string;
      decision: string;
      known: string[];
      unknown: string[];
      nextStep: string | null;
    }>(raw);

    const result: ReframeResult = {
      original: text,
      reframed: parsed.reframed,
      facts: {
        decision: parsed.decision,
        known: parsed.known ?? [],
        unknown: parsed.unknown ?? [],
        nextStep: parsed.nextStep ?? null,
      },
      provider:
        config.kind === "local"
          ? "local"
          : config.kind === "hosted"
            ? "hosted"
            : "mock",
      model: config.model,
    };
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Gemma inference failed.",
      },
      { status: 502 },
    );
  }
}
