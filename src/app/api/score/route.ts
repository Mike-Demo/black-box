import { NextRequest, NextResponse } from "next/server";
import { callGemma, getGemmaConfig, parseModelJson } from "@/lib/gemma";
import { QUALITY_SCORE_SYSTEM_PROMPT } from "@/lib/prompts";

// POST /api/score  { "profile": "...", "jobDescription": "...", "provider"?: "local" | "hosted" }
// Gemma scores the match 1-10 against ONLY what both texts state.
// Stateless: nothing is stored.
export async function POST(req: NextRequest) {
  let profile: string;
  let jobDescription: string;
  let providerOverride: "local" | "hosted" | undefined;
  try {
    const body = (await req.json()) as {
      profile?: unknown;
      jobDescription?: unknown;
      provider?: unknown;
    };
    if (
      typeof body.profile !== "string" ||
      typeof body.jobDescription !== "string" ||
      body.profile.trim().length === 0 ||
      body.jobDescription.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Body must include non-empty 'profile' and 'jobDescription'." },
        { status: 400 },
      );
    }
    profile = body.profile;
    jobDescription = body.jobDescription;
    if (body.provider === "local" || body.provider === "hosted") {
      providerOverride = body.provider;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const serverKind = process.env.GEMMA_PROVIDER ?? "local";
  const config =
    serverKind === "mock"
      ? getGemmaConfig("mock")
      : getGemmaConfig(providerOverride);
  try {
    const raw = await callGemma(
      QUALITY_SCORE_SYSTEM_PROMPT,
      `SCORE_REQUEST\n\nCANDIDATE PROFILE:\n${profile}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      config,
    );
    const parsed = parseModelJson<{ score: number; reasons: string[] }>(raw);
    return NextResponse.json({
      score: Math.max(1, Math.min(10, Math.round(parsed.score))),
      reasons: parsed.reasons ?? [],
      provider:
        config.kind === "local"
          ? "local"
          : config.kind === "hosted"
            ? "hosted"
            : "mock",
      model: config.model,
    });
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
