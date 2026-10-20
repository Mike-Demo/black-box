"use client";

// Add-a-Job: the one intentional input to Black Box.
// Paste a job description, Gemma scores it against YOUR stated profile,
// and the role enters a 48-hour draft hold. Nothing here applies to
// anything — applying happens later, by hand, after the hold, and only
// within today's budget.

import { useState } from "react";
import {
  DRAFT_HOLD_MS,
  useApplications,
  useProfile,
} from "@/lib/store";
import type { JobApplication } from "@/lib/types";

interface ScoreResponse {
  score: number;
  reasons: string[];
  provider: string;
  model: string;
}

export default function AddJob({
  provider,
  onSavedDraft,
  onScored,
}: {
  provider?: "local" | "hosted";
  onSavedDraft?: () => void;
  onScored?: () => void;
}) {
  const { value: profile, update: setProfile } = useProfile();
  const { update: setApplications } = useApplications();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [jd, setJd] = useState("");
  const [score, setScore] = useState<ScoreResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const canSave = company.trim() !== "" && role.trim() !== "";

  async function runScore() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription: jd, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scoring failed");
      setScore(data as ScoreResponse);
      onScored?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scoring failed.");
    } finally {
      setBusy(false);
    }
  }

  function saveDraft() {
    const now = Date.now();
    const app: JobApplication = {
      id: crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      url: url.trim() || undefined,
      status: "draft",
      createdAt: now,
      reviewAfter: now + DRAFT_HOLD_MS,
      qualityScore: score?.score,
      qualityReasons: score?.reasons,
    };
    setApplications((prev) => [app, ...prev]);
    onSavedDraft?.();
    setSaved(
      `Saved to the hold. It will be ready to review on ${new Date(app.reviewAfter).toLocaleString()}.`,
    );
    setCompany("");
    setRole("");
    setUrl("");
    setJd("");
    setScore(null);
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-[0_10px_36px_rgb(87_83_78/0.10)]">
      <h2 className="text-lg font-semibold">Add a job — slowly</h2>
      <p className="mt-1 text-sm text-stone-500">
        One at a time, on purpose. New roles sit in a 48-hour hold before
        they can be marked applied.
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium">
          Your profile (what Gemma scores against)
        </summary>
        <textarea
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border border-stone-300 p-3 text-sm"
          placeholder="Roles you want, skills you actually have, location / work-type constraints, salary floor — only what is true and stated."
        />
        <p className="mt-1 text-xs text-stone-400">
          Stored only in this browser. Gemma scores strictly against what
          you write here — it will not assume anything you leave out.
        </p>
      </details>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-xl border border-stone-300 p-3 text-sm"
          placeholder="Company"
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-stone-300 p-3 text-sm"
          placeholder="Role"
        />
      </div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="mt-3 w-full rounded-xl border border-stone-300 p-3 text-sm"
        placeholder="Posting URL (optional)"
      />
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={5}
        className="mt-3 w-full rounded-xl border border-stone-300 p-3 text-sm"
        placeholder="Paste the job description to score it (optional)…"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={runScore}
          disabled={busy || jd.trim() === "" || profile.trim() === ""}
          className="rounded-full bg-[#4338ca] px-5 py-2 text-sm text-white disabled:opacity-40"
        >
          {busy ? "Scoring…" : "Score with Gemma"}
        </button>
        <button
          onClick={saveDraft}
          disabled={!canSave}
          className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white disabled:opacity-40"
        >
          Save to the 48-hour hold
        </button>
        {profile.trim() === "" && jd.trim() !== "" && (
          <span className="text-xs text-stone-400">
            Add your profile above before scoring.
          </span>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      {saved && <p className="mt-3 text-sm text-indigo-900">{saved}</p>}

      {score && (
        <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm">
          <p>
            <span className="text-2xl font-bold">{score.score}/10</span>{" "}
            <span className="text-stone-500">
              match against your stated profile
            </span>
          </p>
          <ul className="mt-2 list-disc pl-5">
            {score.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-stone-400">
            Scored by Gemma ({score.model}) via the {score.provider} path.
            A low score is information, not a verdict — the hold applies
            either way.
          </p>
        </div>
      )}
    </section>
  );
}
