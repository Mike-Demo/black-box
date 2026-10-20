"use client";

// /demo — the shareable demo-account link. Visiting it seeds a week of
// sample data into this browser and signs in as demo@mikedemo.email,
// then lands on the populated dashboard. Linked from the sign-in
// screen, the README, and the DEV submission post so judges can try
// the full app in one click.

import { useEffect } from "react";
import { loadDemoAccountAndGo } from "@/lib/demo";

export default function DemoPage() {
  useEffect(() => {
    loadDemoAccountAndGo();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <p className="font-display text-lg text-stone-500">
        Opening the demo account… 🦥
      </p>
      <p className="text-sm text-stone-400">
        A week of sample applications, mail, and mood marks is being laid
        out in this browser. No account is created and nothing is sent
        anywhere — the data lives here, like everything in Black Box.
      </p>
    </main>
  );
}
