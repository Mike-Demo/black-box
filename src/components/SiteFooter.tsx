"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

/**
 * Demo's standard site footer (happy-code-library SiteFooter pattern):
 * attribution, copyright year, an "Open Source" link to /licenses, and
 * the standard social links — restyled for Black Box's pastel theme.
 * The GitHub link points at this project's repo.
 *
 * Also loads the standard CO2.js rollout assets (self-hosted
 * @tgwf/co2 v0.19.0 + the canonical co2-footer.js loader), which append
 * the per-visit estimate line into this footer. The estimate is
 * computed in the browser from transferred bytes — no external calls,
 * no tracking, and no green claim: it is an estimate, nothing more.
 */
const SOCIAL_LINKS = [
  {
    label: "Black Box on GitHub",
    href: "https://github.com/Mike-Demo/black-box",
    text: "GitHub",
  },
  {
    label: "MikeDemo on LinkedIn",
    href: "https://www.linkedin.com/in/mikedemopoulos",
    text: "LinkedIn",
  },
  { label: "MikeDemo on X", href: "https://x.com/mike_demo", text: "X" },
  {
    label: "@demo on tweet.app",
    href: "https://app.tweet.app/post/92206629-1525-4a74-8f51-39e226fc9e75",
    text: "tweet.app",
  },
  {
    label: "MikeDemo on Threads",
    href: "https://www.threads.com/@mdemop",
    text: "Threads",
  },
] as const;

export default function SiteFooter() {
  // Resolve the year after hydration so server and client markup match
  // (same approach as the standard pattern).
  const [year, setYear] = useState<number | undefined>(undefined);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mx-auto w-full max-w-3xl px-4 pb-10 pt-2 text-center text-sm text-stone-500">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>Made by MikeDemo</span>
        {year !== undefined && (
          <span aria-label={`Copyright ${year}`}>© {year}</span>
        )}
      </div>

      <nav aria-label="Legal links" className="mt-2">
        <Link
          href="/licenses"
          className="font-medium text-indigo-700 underline-offset-4 hover:underline"
        >
          Open Source
        </Link>
      </nav>

      <nav
        aria-label="Social links"
        className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
      >
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (opens in new tab)`}
            className="underline-offset-4 hover:text-stone-700 hover:underline"
          >
            {link.text}
          </a>
        ))}
      </nav>

      {/* The canonical CO2 loader appends the estimate <p> into this
          footer (it looks for the first <footer> on the page). */}
      <Script src="/co2.min.js" strategy="afterInteractive" />
      <Script src="/co2-footer.js" strategy="afterInteractive" />
    </footer>
  );
}
