"use client";

import { useMemo, useState } from "react";
import BreathingGate from "@/components/BreathingGate";
import ReframePanel from "@/components/ReframePanel";
import {
  todayLocal,
  useApplications,
  useMood,
  useVault,
  vaultIsOpen,
} from "@/lib/store";

const MOODS = ["😔", "🙁", "😐", "🙂", "😄"] as const;

export default function Dashboard() {
  const { vault, setVault, hydrated: vaultReady } = useVault();
  const { value: applications } = useApplications();
  const { value: mood, update: setMood } = useMood();
  const [gating, setGating] = useState(false);

  const open = vaultIsOpen(vault);
  const today = todayLocal();
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">
          Black Box <span aria-hidden="true">🦥</span>
        </h1>
        <p className="mt-1 text-neutral-600">
          A job search app that slows you down on purpose. Your data lives in
          this browser; Gemma runs on your machine in local mode.
        </p>
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
        {vault.appliedToday >= vault.dailyLimit && (
          <p className="mt-2 text-sm text-emerald-800">
            Budget spent. That&apos;s the whole job for today — the rest of the
            day is yours.
          </p>
        )}
      </section>

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
            {applications.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">
                No applications tracked yet. Add one and it will wait here,
                quietly, until tomorrow&apos;s opening.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-neutral-100 text-sm">
                {applications.map((a) => (
                  <li key={a.id} className="flex justify-between py-2">
                    <span>
                      {a.role} · {a.company}
                    </span>
                    <span className="text-neutral-500">
                      {a.status === "no-response-yet"
                        ? "No response yet"
                        : a.status}
                    </span>
                  </li>
                ))}
              </ul>
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

      <ReframePanel />

      <footer className="pb-6 text-center text-xs text-neutral-400">
        Slow and steady. Built with Gemma 4, an open-weight model, for
        Hacktoberfest Week 3.
      </footer>
    </main>
  );
}
