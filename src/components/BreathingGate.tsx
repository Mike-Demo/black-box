"use client";

// The breathing gate: a short, fixed pause before the vault reveals
// statuses. Pure CSS animation + a timer — no audio, no accounts,
// nothing to configure. 4s in · 4s hold · 4s out, two rounds (~24s),
// then a plain "Open the vault" button. Skippable after the first
// full breath — the point is a pause, not a punishment.

import { useEffect, useRef, useState } from "react";

const PHASES = [
  { label: "Breathe in", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Breathe out", seconds: 4 },
] as const;

export default function BreathingGate({ onDone }: { onDone: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds);
  const [finished, setFinished] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // advance phase
        setPhaseIndex((p) => {
          const next = p + 1;
          if (next >= PHASES.length) {
            setRound((r) => {
              if (r >= 2) {
                setFinished(true);
                if (timer.current) clearInterval(timer.current);
                return r;
              }
              return r + 1;
            });
            return 0;
          }
          return next;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
      });
    }, 1000);
    const skipTimer = setTimeout(() => setCanSkip(true), 12000);
    return () => {
      if (timer.current) clearInterval(timer.current);
      clearTimeout(skipTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase = PHASES[phaseIndex];
  const scale =
    phase.label === "Breathe in"
      ? "scale-125"
      : phase.label === "Hold"
        ? "scale-125"
        : "scale-100";

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div
        className={`flex h-36 w-36 items-center justify-center rounded-full bg-[#e9e4f8] text-indigo-900 shadow-[0_10px_36px_rgb(87_83_78/0.12)] transition-transform duration-[4000ms] ease-in-out ${scale}`}
        aria-hidden="true"
      >
        <span className="text-4xl">🦥</span>
      </div>
      {!finished ? (
        <>
          <p className="text-lg" role="status">
            {phase.label} · {secondsLeft}
          </p>
          <p className="max-w-sm text-sm text-stone-500">
            The vault opens once a day. A few slow breaths first — the
            statuses will be exactly the same in half a minute.
          </p>
          {canSkip && (
            <button
              onClick={onDone}
              className="text-sm text-stone-500 underline underline-offset-4"
            >
              Skip the pause and open
            </button>
          )}
        </>
      ) : (
        <button
          onClick={onDone}
          className="rounded-full bg-[#4338ca] px-6 py-3 text-white"
        >
          Open the vault
        </button>
      )}
      <span className="sr-only">Breath {round} of 2</span>
    </div>
  );
}
