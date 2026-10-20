"use client";

// Email sign-in — SIMULATED in this demo build, and labelled as such in
// the UI itself. No email is sent and no server account is created: the
// "sign-in link" is a button on this screen, and the session it creates
// is just the typed email address, stored in this browser like all other
// Black Box data. Signing in is what switches the application-email
// inbox on; everything else works without it.

import { useState } from "react";
import { loadDemoAccountAndGo } from "@/lib/demo";

export default function SignIn({
  onSignedIn,
  onContinueAsGuest,
}: {
  onSignedIn: (email: string) => void;
  onContinueAsGuest: () => void;
}) {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
        Slow and steady
      </p>
      <h1 className="font-display mt-2 text-center text-3xl font-semibold text-stone-800">
        Black Box
      </h1>
      <p className="mt-1 text-center text-stone-500">
        Your applications, at your pace.
      </p>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-[0_10px_36px_rgb(87_83_78/0.10)]">
        {!linkSent ? (
          <>
            <label
              htmlFor="bb-email"
              className="text-xs font-semibold uppercase tracking-wider text-stone-500"
            >
              Email address
            </label>
            <input
              id="bb-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-[#4338ca] focus:outline-none"
            />
            <button
              onClick={() => valid && setLinkSent(true)}
              disabled={!valid}
              className="mt-4 w-full rounded-full bg-[#4338ca] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Email me a sign-in link →
            </button>
            <button
              onClick={onContinueAsGuest}
              className="mt-3 w-full py-1 text-sm text-[#4338ca]"
            >
              Continue without signing in →
            </button>
            <button
              onClick={loadDemoAccountAndGo}
              className="mt-1 w-full py-1 text-sm text-stone-500"
            >
              Just exploring? Load the demo account →
            </button>
            <p className="mt-1 text-center text-xs text-stone-400">
              One click: a week of sample data, signed in as
              demo@mikedemo.email.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold">Check your inbox</h2>
            <p className="mt-1 text-sm text-stone-500">
              A sign-in link is on its way to{" "}
              <span className="font-medium text-stone-700">
                {email.trim()}
              </span>
              . In a live build it would arrive by email; in this demo it is
              simulated, so the link is right here:
            </p>
            <button
              onClick={() => onSignedIn(email.trim())}
              className="mt-4 w-full rounded-full bg-[#4338ca] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Open the simulated sign-in link
            </button>
            <button
              onClick={() => setLinkSent(false)}
              className="mt-3 w-full py-1 text-sm text-stone-500"
            >
              Use a different email
            </button>
          </>
        )}
      </section>

      <p className="mt-4 text-center text-xs leading-relaxed text-stone-400">
        Demo build: the sign-in link is simulated. No real email is sent,
        no server account is created, and everything you save stays in this
        browser.
      </p>
      <p className="mt-3 text-center">
        <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-500">
          ● On-device storage mode — sign-in is simulated for this demo
        </span>
      </p>
    </main>
  );
}
