"use client";

// Black Box is a local-first app: every piece of state lives in the
// browser's localStorage, so there is nothing meaningful to server-render.
// Loading the dashboard client-only keeps Next's prerender away from
// clock/storage reads and guarantees the first paint matches local state.

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./Dashboard"), {
  ssr: false,
  loading: () => (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <p className="font-display text-lg text-stone-500">Opening Black Box… 🦥</p>
    </main>
  ),
});

export default function DashboardLoader() {
  return <Dashboard />;
}
