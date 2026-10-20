"use client";

import { useEffect, useMemo, useState } from "react";
import AddJob from "@/components/AddJob";
import BreathingGate from "@/components/BreathingGate";
import ReframePanel from "@/components/ReframePanel";
import {
  todayLocal,
  useApplications,
  useMood,
  useVault,
  vaultIsOpen,
} from "@/lib/store";
import type { JobApplication } from "@/lib/types";

const MOODS = ["😔", "🙁", "😐", "🙂", "😄"] as const;
const MODE_KEY = "blackbox.mode.v1";

interface ServerConfig {
  defaultProvider: string;
  hosted: { model: string; configured: boolean };
  mock: boolean;
}

type Mode = "local" | "hosted";

export default function Dashboard() {
  const { vault, setVault, hydrated: vaultReady } = useVault();
  const { value: applications, update: setApplications } = useApplications();
  const { value: mood, update: setMood } = useMood();
  const [gating, setGating] = useState(false);
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [mode, setMode] = useState<Mode>("local");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c: ServerConfig) => {
        setConfig(c);
        const stored = window.localStorage.getItem(MODE_KEY);
        if (stored === "local" || stored === "hosted") setMode(stored);
        else if (c.defaultProvider === "hosted") setMode("hosted");
      })
      .catch(() => setConfig(null));
  }, []);

  function pickMode(m: Mode) {
    setMode(m);
    try {
      window.localStorage.setItem(MODE_KEY, m);
    } catch {
      /* in-memory only */
    }
  }

  const open = vaultIsOpen(vault);
  const today = todayLocal();
  // "Now" lives in state (set on mount, refreshed each minute) so render
  // stays pure — the draft-hold readiness check reads it from here.
  const [now, setNow] = useState(0);
  useEffect(() => {
    // Clock sync on mount is the intended external-system read here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const budgetSpent = vault.appliedToday >= vault.dailyLimit;

  const drafts = applications.filter((a) => a.status === "draft");
  const active = applications.filter(
    (a) => a.status === "applied" || a.status === "no-response-yet",
  );
  const closed = applications.filter((a) => a.status === "closed");

  const todaysMood = mood.find((m) => m.date === today);
  const last7 = useMemo(() => {
    const out: { date: string; mood?: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayLocal(d);
      out.push({ date: key, mood: mood.find((m) => m.date === key)?.mood });
    }
    return out;
  }, [mood]);

  function openVault() {
    setGating(false);
    setVault({ ...vault, lastOpenedDate: today, appliedDate: today });
  }

  function pickMood(v: 1 | 2 | 3 | 4 | 5) {
    setMood((prev) => [
      ...prev.filter((m) => m.date !== today),
      { date: today, mood: v },
    ]);
  }

  function patchApp(id: string, patch: Partial<JobApplication>) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  }

  function removeApp(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  function confirmApplied(a: JobApplication) {
    if (budgetSpent) return;
    patchApp(a.id, { status: "applied" });
    setVault({
      ...vault,
      appliedToday: vault.appliedToday + 1,
      appliedDate: today,
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">
          Black Box <span aria-hidden="true">🦥</span>
        </h1>
        <p className="mt-1 text-neutral-600">
          A job search app that slows you down on purpose. Your data lives in
          this browser; nothing is tracked or uploaded.
        </p>
        {/* Privacy mode — real, wired to the API routes. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Inference:</span>
          {config?.mock ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
              Mock mode — no model is being called
            </span>
          ) : (
            <>
              <button
                onClick={() => pickMode("local")}
                aria-pressed={mode === "local"}
                className={`rounded-full px-3 py-1 ${
                  mode === "local"
                    ? "bg-emerald-700 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                Local — Gemma on this device
              </button>
              <button
                onClick={() => config?.hosted.configured && pickMode("hosted")}
                aria-pressed={mode === "hosted"}
                disabled={!config?.hosted.configured}
                title={
                  config?.hosted.configured
                    ? "Use the hosted Gemma endpoint"
                    : "This server has no hosted Gemma key configured"
                }
                className={`rounded-full px-3 py-1 ${
                  mode === "hosted"
                    ? "bg-emerald-700 text-white"
                    : "bg-neutral-100 text-neutral-600"
                } disabled:opacity-40`}
              >
                Demo — hosted Gemma
              </button>
              <span className="text-xs text-neutral-400">
                {mode === "local"
                  ? "Reframe and score text goes to the Gemma running on this machine, nowhere else."
                  : "Demo mode sends reframe and score text to the hosted provider for that call."}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Daily budget */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Today&apos;s budget</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {vaultReady
            ? `${vault.appliedToday} of ${vault.dailyLimit} applications used today.`
            : "…"}
        </p>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuenow={vault.appliedToday}
          aria-valuemax={vault.dailyLimit}
        >
          <div
            className="h-full bg-emerald-600"
            style={{
              width: `${Math.min(100, (vault.appliedToday / Math.max(1, vault.dailyLimit)) * 100)}%`,
            }}
          />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          Daily limit
          <input
            type="number"
            min={1}
            max={20}
            value={vault.dailyLimit}
            onChange={(e) =>
              setVault({
                ...vault,
                dailyLimit: Math.max(1, Number(e.target.value) || 1),
                appliedDate: today,
              })
            }
            className="w-16 rounded-lg border border-neutral-300 px-2 py-1"
          />
        </label>
        {budgetSpent && (
          <p className="mt-2 text-sm text-emerald-800">
            Budget spent. That&apos;s the whole job for today — the rest of
            the day is yours.
          </p>
        )}
      </section>

      <AddJob provider={config?.mock ? undefined : mode} />

      {/* The Vault */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">The Vault</h2>
        {!open && !gating && (
          <>
            <p className="mt-1 text-sm text-neutral-500">
              Statuses are shut until your daily opening. Checking more often
              changes nothing — it only costs attention.
            </p>
            <button
              onClick={() => setGating(true)}
              className="mt-3 rounded-full bg-neutral-900 px-5 py-2 text-sm text-white"
            >
              Begin today&apos;s opening
            </button>
          </>
        )}
        {gating && <BreathingGate onDone={openVault} />}
        {open && (
          <>
            <p className="mt-1 text-sm text-emerald-800">
              Open for today. It closes again at midnight.
            </p>

            {applications.length === 0 && (
              <p className="mt-3 text-sm text-neutral-500">
                Nothing tracked yet. Add a job above and it will wait here,
                quietly, in its 48-hour hold.
              </p>
            )}

            {drafts.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  In the hold
                </h3>
                <ul className="mt-2 space-y-3">
                  {drafts.map((a) => {
                    const ready = a.reviewAfter <= now;
                    return (
                      <li
                        key={a.id}
                        className="rounded-xl bg-neutral-50 p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-medium">
                            {a.role} · {a.company}
                            {a.qualityScore != null && (
                              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">
                                Gemma score {a.qualityScore}/10
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {ready
                              ? "Ready to review"
                              : `In hold until ${new Date(a.reviewAfter).toLocaleString()}`}
                          </span>
                        </div>
                        {ready && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => confirmApplied(a)}
                              disabled={budgetSpent}
                              className="rounded-full bg-emerald-700 px-4 py-1.5 text-white disabled:opacity-40"
                            >
                              I applied — count it
                            </button>
                            <button
                              onClick={() => removeApp(a.id)}
                              className="rounded-full bg-neutral-200 px-4 py-1.5"
                            >
                              Let it go
                            </button>
                            {budgetSpent && (
                              <span className="text-xs text-neutral-500">
                                Today&apos;s budget is spent — this can wait
                                until tomorrow. That&apos;s the point.
                              </span>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {active.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Applied
                </h3>
                <ul className="mt-2 divide-y divide-neutral-100 text-sm">
                  {active.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span>
                        {a.role} · {a.company}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-neutral-500">
                          {a.status === "no-response-yet"
                            ? "No response yet"
                            : "Applied"}
                        </span>
                        {a.status === "applied" && (
                          <button
                            onClick={() =>
                              patchApp(a.id, { status: "no-response-yet" })
                            }
                            className="rounded-full bg-neutral-100 px-3 py-1 text-xs"
                          >
                            Mark: no response yet
                          </button>
                        )}
                        <button
                          onClick={() => patchApp(a.id, { status: "closed" })}
                          className="rounded-full bg-neutral-100 px-3 py-1 text-xs"
                        >
                          Outcome received
                        </button>
                        <button
                          onClick={() => removeApp(a.id)}
                          aria-label={`Remove ${a.company}`}
                          className="rounded-full bg-neutral-100 px-2 py-1 text-xs"
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {closed.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Closed
                </h3>
                <ul className="mt-2 divide-y divide-neutral-100 text-sm text-neutral-400">
                  {closed.map((a) => (
                    <li key={a.id} className="flex justify-between py-2">
                      <span>
                        {a.role} · {a.company}
                      </span>
                      <button
                        onClick={() => removeApp(a.id)}
                        aria-label={`Remove ${a.company}`}
                        className="text-xs"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </section>

      {/* Mood check-in */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">One-tap check-in</h2>
        <p className="mt-1 text-sm text-neutral-500">
          No streaks, no scores. Just a mark for today, if you want one.
        </p>
        <div className="mt-3 flex gap-2">
          {MOODS.map((emoji, i) => (
            <button
              key={emoji}
              onClick={() => pickMood((i + 1) as 1 | 2 | 3 | 4 | 5)}
              aria-pressed={todaysMood?.mood === i + 1}
              className={`rounded-full border px-3 py-2 text-xl ${
                todaysMood?.mood === i + 1
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-neutral-200"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-end gap-2" aria-hidden="true">
          {last7.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <div
                className="w-6 rounded bg-emerald-200"
                style={{ height: `${(d.mood ?? 0) * 8 + 2}px` }}
              />
              <span className="text-[10px] text-neutral-400">
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <ReframePanel provider={config?.mock ? undefined : mode} />

      <footer className="pb-6 text-center text-xs text-neutral-400">
        Slow and steady. Built with Gemma 4, an open-weight model, for
        Hacktoberfest Week 3.
      </footer>
    </main>
  );
}
