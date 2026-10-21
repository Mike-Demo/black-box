import Link from "next/link";

/**
 * The standard open-source license page (LicensesPage pattern), served
 * at /licenses and /open-source and linked from the site footer as
 * "Open Source". Every entry is this app's real stack, checked against
 * package.json and the repo — nothing credited that isn't used.
 */
interface LicenseEntry {
  name: string;
  author: string;
  license: string;
  url: string;
  note?: string;
}

interface LicenseGroup {
  title: string;
  entries: LicenseEntry[];
}

const GROUPS: LicenseGroup[] = [
  {
    title: "This project",
    entries: [
      {
        name: "Black Box",
        author: "Mike Demopoulos",
        license: "MIT",
        url: "https://github.com/Mike-Demo/black-box/blob/main/LICENSE",
        note: "Black Box itself is open source, built in the open for the DEV Hacktoberfest Open-Source AI Challenge. The demo data is fictional sample data, and the app keeps everything in your browser's local storage — there is no account and no server-side database.",
      },
    ],
  },
  {
    title: "Software",
    entries: [
      {
        name: "Next.js",
        author: "Vercel and contributors",
        license: "MIT",
        url: "https://github.com/vercel/next.js/blob/canary/license.md",
        note: "The framework this app is built on — UI, API routes, and the hosted demo all run on it.",
      },
      {
        name: "React & React DOM",
        author: "Meta and contributors",
        license: "MIT",
        url: "https://github.com/facebook/react/blob/main/LICENSE",
      },
      {
        name: "Tailwind CSS",
        author: "Tailwind Labs, Inc.",
        license: "MIT",
        url: "https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE",
      },
      {
        name: "TypeScript",
        author: "Microsoft",
        license: "Apache-2.0",
        url: "https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt",
      },
      {
        name: "CO2.js (@tgwf/co2)",
        author: "The Green Web Foundation",
        license: "Apache-2.0",
        url: "https://github.com/thegreenwebfoundation/co2.js/blob/main/LICENSE.txt",
        note: "Version 0.19.0 (SWD model v4), self-hosted. It powers the per-visit estimate in the footer, computed in your browser from transferred bytes — no external calls and no tracking. The number is an estimate, not a certification, and this page makes no green claim.",
      },
    ],
  },
  {
    title: "The model",
    entries: [
      {
        name: "Gemma 4",
        author: "Google DeepMind",
        license: "Apache-2.0",
        url: "https://deepmind.google/models/gemma/",
        note: "The open-weight model behind the reframes and fit scores. In this hosted demo it is served by OpenRouter; run the repo locally and the same prompts run on your own machine via Ollama — your applications and emails never have to leave your device.",
      },
      {
        name: "Ollama",
        author: "Ollama and contributors",
        license: "MIT",
        url: "https://github.com/ollama/ollama/blob/main/LICENSE",
        note: "The local runtime for Gemma when you self-host Black Box.",
      },
    ],
  },
  {
    title: "Fonts",
    entries: [
      {
        name: "Fraunces",
        author: "Undercase Type",
        license: "SIL OFL 1.1",
        url: "https://github.com/undercasetype/Fraunces/blob/master/OFL.txt",
        note: "The serif used for headlines and the mood word.",
      },
      {
        name: "Geist & Geist Mono",
        author: "Vercel",
        license: "SIL OFL 1.1",
        url: "https://github.com/vercel/geist-font/blob/main/LICENSE.txt",
        note: "The interface typefaces.",
      },
    ],
  },
  {
    title: "Design references",
    entries: [
      {
        name: "Microsoft Inclusive Design — Mental Health Guidebook & Cards",
        author: "Microsoft",
        license: "Design guidance (credited, not code)",
        url: "https://inclusive.microsoft.design/articles/mental-health-guidebook",
        note: "Microsoft's inclusive-design guidance for mental health shaped this app: preserve the person's own words, direct with clear next steps, and customize without pressure. The reframe feature follows the same discipline — facts unchanged, original always kept, no advice, no streaks.",
      },
    ],
  },
  {
    title: "Services",
    entries: [
      {
        name: "Render",
        author: "Render, Inc.",
        license: "Proprietary service",
        url: "https://render.com",
        note: "Hosts this demo as a single web service.",
      },
      {
        name: "OpenRouter",
        author: "OpenRouter, Inc.",
        license: "Proprietary service",
        url: "https://openrouter.ai",
        note: "Serves the hosted Gemma 4 model for this public demo. The local path (Ollama) needs no third party at all.",
      },
      {
        name: "GitHub",
        author: "GitHub, Inc.",
        license: "Proprietary service",
        url: "https://github.com",
        note: "Hosts the source code.",
      },
    ],
  },
];

function CreditList({ entries }: { entries: LicenseEntry[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li
          key={entry.name}
          className="rounded-[2rem] bg-white/70 p-6 shadow-[0_10px_40px_-18px_rgba(68,64,60,0.35)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-stone-800">
              {entry.name}
            </h3>
            <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-medium text-violet-900">
              {entry.license}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-500">{entry.author}</p>
          {entry.note && (
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {entry.note}
            </p>
          )}
          <a
            className="mt-3 inline-block text-sm font-medium text-indigo-700 underline-offset-4 hover:underline"
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            License source ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function OpenSourcePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-indigo-700 underline-offset-4 hover:underline"
        >
          ← Back to Black Box
        </Link>
        <h1 className="font-display mt-4 text-[2rem] font-semibold leading-tight text-stone-800">
          Open source &amp; credits
        </h1>
        <p className="mt-2 leading-relaxed text-stone-600">
          Black Box is open source (MIT) and built on open source software,
          an open-weight model, and freely licensed fonts and design
          guidance. Everything it depends on is credited below. The code
          lives at{" "}
          <a
            href="https://github.com/Mike-Demo/black-box"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-700 underline-offset-4 hover:underline"
          >
            github.com/Mike-Demo/black-box
          </a>
          .
        </p>
      </div>

      {GROUPS.map((group) => (
        <section key={group.title} className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-stone-800">
            {group.title}
          </h2>
          <CreditList entries={group.entries} />
        </section>
      ))}
    </main>
  );
}
