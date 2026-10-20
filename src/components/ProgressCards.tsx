"use client";

// The Progress section: achievement cards for the app's own slow
// behaviours. Earned cards are full-strength with the earned date;
// unearned cards stay quiet, with a factual counter where one exists.
// A record of process — not points, not prizes, nothing to lose.

import { ACHIEVEMENTS, type AchievementContext } from "@/lib/achievements";

export default function ProgressCards({ ctx }: { ctx: AchievementContext }) {
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned(ctx)).length;
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Progress
        </h2>
        <p className="text-xs text-neutral-400">
          {earnedCount} of {ACHIEVEMENTS.length} cards
        </p>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Deliberate milestones: restraint, reflection, and patience. Nothing
        here can be lost.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const earned = a.earned(ctx);
          const earnedAt = ctx.progress.earnedAt[a.id];
          const counter = !earned && a.progress ? a.progress(ctx) : null;
          return (
            <div
              key={a.id}
              className={`rounded-xl border p-3.5 ${
                earned
                  ? "border-neutral-200 bg-white"
                  : "border-neutral-100 bg-neutral-50/60"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                  earned
                    ? "bg-[#0071ec] text-white"
                    : "border border-neutral-300 text-neutral-400"
                }`}
              >
                {earned ? "✓" : a.mark}
              </span>
              <h3
                className={`mt-2.5 text-sm font-semibold ${
                  earned ? "text-[#1b1d26]" : "text-neutral-500"
                }`}
              >
                {a.title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                {a.how}
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                {earned
                  ? earnedAt
                    ? `Earned ${new Date(earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                    : "Earned"
                  : counter
                    ? `Progress — ${counter.n} / ${counter.of}`
                    : "Not yet"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
