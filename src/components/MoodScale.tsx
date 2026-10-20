"use client";

// Mood check-in as a scale, in the spirit of Voda's daily check-in:
// one gradient slider from Rough to Good, the chosen word read back in
// plain language, and a quiet 7-day dot trend. Self-report only — the
// app never guesses a mood; an unmarked day is simply unmarked.

const WORDS = ["Rough", "Tiring", "Neutral", "Steady", "Good"] as const;
const ECHO: Record<(typeof WORDS)[number], string> = {
  Rough: "A rough one. It's marked — that's enough.",
  Tiring: "A tiring one.",
  Neutral: "Neither way, today.",
  Steady: "Steady, today.",
  Good: "A good one.",
};
const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"] as const;
/** The handle is an emoji face, one per stop on the scale. */
const FACES = ["😞", "🥱", "😐", "🙂", "😊"] as const;

export function moodWord(v: number): string {
  return WORDS[Math.min(5, Math.max(1, v)) - 1];
}

export default function MoodScale({
  value,
  onPick,
  last7,
}: {
  value: 1 | 2 | 3 | 4 | 5 | null;
  onPick: (v: 1 | 2 | 3 | 4 | 5) => void;
  last7: { date: string; mood?: number }[];
}) {
  const shown = value ?? 3;
  return (
    <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgb(27_29_38/0.05)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          How is today
        </h2>
        <p className="text-xs text-neutral-400">
          No streaks. Just a mark for today, if you want one.
        </p>
      </div>

      <div className="mt-5 px-1">
        <div className="relative h-9">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#dc3146,#fac22b_50%,#00ac49)]"
          />
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={shown}
            onChange={(e) =>
              onPick(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
            }
            aria-label={`Mood scale, currently ${value ? moodWord(value) : "not marked"}`}
            className="mood-scale relative h-9 w-full"
          />
          <span
            aria-hidden="true"
            style={{
              left: `calc(${((shown - 1) / 4).toFixed(2)} * (100% - 36px) + 18px)`,
            }}
            className={`pointer-events-none absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl shadow-[0_1px_5px_rgb(0_0_0/0.3)] ring-1 ring-neutral-200 transition-[left] duration-200 ease-out ${
              value ? "" : "opacity-70"
            }`}
          >
            {value ? FACES[value - 1] : "🦥"}
          </span>
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-neutral-400">
          <span>● Rough</span>
          <span>Good ●</span>
        </div>
      </div>

      <p className="mt-3 text-center" aria-live="polite">
        {value ? (
          <>
            <span className="text-xl font-semibold">{moodWord(value)}</span>
            <span className="mt-0.5 block text-sm text-neutral-500">
              {ECHO[moodWord(value) as (typeof WORDS)[number]]}
            </span>
          </>
        ) : (
          <span className="text-sm text-neutral-400">
            Slide to mark today — or leave it unmarked.
          </span>
        )}
      </p>

      <div className="mt-5 border-t border-neutral-100 pt-3">
        <div className="flex items-center gap-2.5" aria-hidden="true">
          {last7.map((d) => (
            <span key={d.date} className="flex flex-col items-center gap-1">
              <span
                className={`inline-block h-3 w-3 rounded-full ${
                  d.mood
                    ? d.mood >= 4
                      ? "bg-[#00ac49]"
                      : d.mood === 3
                        ? "bg-neutral-300"
                        : d.mood === 2
                          ? "bg-[#fac22b]"
                          : "bg-[#dc3146]"
                    : "bg-neutral-100"
                }`}
              />
              <span className="text-[10px] text-neutral-400">
                {WEEKDAY[new Date(`${d.date}T12:00:00`).getDay()]}
              </span>
            </span>
          ))}
          <span className="ml-1 text-xs text-neutral-400">last 7 days</span>
        </div>
      </div>
    </section>
  );
}
