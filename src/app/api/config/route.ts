import { connection, NextResponse } from "next/server";
import { getGemmaConfig } from "@/lib/gemma";

// GET /api/config — tells the UI which inference paths this deployment
// offers, so the Privacy Mode control can be honest: it only offers a
// choice when the server is actually configured for both paths.
// No secrets are exposed: only provider kinds and public model names.
export async function GET() {
  // Runtime env decides the answer — defer to request time so this is
  // never prerendered with build-time values.
  await connection();
  const serverKind = process.env.GEMMA_PROVIDER ?? "local";
  const local = getGemmaConfig("local");
  const hosted = getGemmaConfig("hosted");
  return NextResponse.json({
    defaultProvider: serverKind,
    local: { model: local.model },
    hosted: { model: hosted.model, configured: Boolean(hosted.apiKey) },
    mock: serverKind === "mock",
  });
}
