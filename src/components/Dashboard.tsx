"use client";

import { useEffect, useMemo, useState } from "react";
import AddJob from "@/components/AddJob";
import BreathingGate from "@/components/BreathingGate";
import InboxEmailView, {
  STATUS_CHIP,
  STATUS_LABEL,
} from "@/components/InboxEmailView";
import MoodScale from "@/components/MoodScale";
import ProgressCards from "@/components/ProgressCards";
import ReframePanel from "@/components/ReframePanel";
import SignIn from "@/components/SignIn";
import { ACHIEVEMENTS, type AchievementContext } from "@/lib/achievements";
import {
  todayLocal,
  useApplications,
  useGuest,
  useInbox,
  useMood,
  useProgress,
  useSession,
  useVault,
  vaultIsOpen,
} from "@/lib/store";
import type { InboxEmail, JobApplication, ProgressState } from "@/lib/types";

const MODE_KEY = "blackbox.mode.v1";

interface ServerConfig {
  defaultProvider: string;
  hosted: { model: string; configured: boolean };
  mock: boolean;
}

type Mode = "local" | "hosted";

function hoursLeft(ms: number, now: number): string {
  const h = Math.max(0, Math.round((ms - now) / 3600000));
  return h >= 1 ? `${h}h left in hold` : "Under an hour left in hold";
}

export default function Dashboard() {
  const { vault, setVault, hydrated: vaultReady } = useVault();
  const { value: applications, update: setApplications } = useApplications();
  const { value: mood, update: setMood } = useMood();
  const { value: session, update: setSession, hydrated: sessionReady } =
    useSession();
  const { value: guest, update: setGuest, hydrated: guestReady } = useGuest();
  const { value: inbox, update: setInbox } = useInbox();
  const {
    value: progress,
    update: setProgress,
    hydrated: progressReady,
  } = useProgress();
  const [gating, setGating] = useState(false);
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [mode, setMode] = useState<Mode>("local");
  const [openEmailId, setOpenEmailId] = useState<string | null>(null);

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

  // Inbox: mail that arrived after its day's window is held for the next
  // one. "Available" = not held, or it arrived on an earlier day.
  const mailAvailable = (m: InboxEmail) =>
    !m.heldForNextWindow ||
    todayLocal(new Date(m.receivedAt)) < today;
  const availableMail = inbox.filter(mailAvailable);
  const heldMail = inbox.filter((m) => !mailAvailable(m));
  const unreadCount = availableMail.filter((m) => !m.readAt).length;
  const openEmail = inbox.find((m) => m.id === openEmailId) ?? null;

  // Progress cards: context + first-earned date stamping.
  const achievementCtx: AchievementContext = {
    progress,
    moodDays: mood.length,
    inboxRead: inbox.filter((m) => m.readAt).length,
  };
  const earnedKey = ACHIEVEMENTS.filter((a) => a.earned(achievementCtx))
    .map((a) => a.id)
    .join(",");
  useEffect(() => {
    if (!progressReady || !earnedKey || now === 0) return;
    const missing = earnedKey
      .split(",")
      .filter((id) => !progress.earnedAt[id]);
    if (missing.length === 0) return;
    setProgress((prev) => {
      const earnedAt = { ...prev.earnedAt };
      let changed = false;
      for (const id of missing) {
        if (!earnedAt[id]) {
          earnedAt[id] = now;
          changed = true;
        }
      }
      return changed ? { ...prev, earnedAt } : prev;
    });
    // Stamping depends on which cards are earned, not on progress writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedKey, progressReady, now]);

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

  function bumpProgress(
    field:
      | "draftsEver"
      | "appliedEver"
      | "letGoEver"
      | "heldFullEver"
      | "scoresEver"
      | "reframesEver",
  ) {
    setProgress((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  }

  function openVault() {
    setGating(false);
    setVault({ ...vault, lastOpenedDate: today, appliedDate: today });
    setProgress((prev) =>
      prev.openedDates.includes(today)
        ? prev
        : { ...prev, openedDates: [...prev.openedDates, today] },
    );
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

  function removeApp(a: JobApplication) {
    // Releasing a DRAFT is the "let one go" behaviour the progress
    // cards record; removing an already-decided row is just tidying.
    if (a.status === "draft") {
      bumpProgress("letGoEver");
      if (a.reviewAfter <= now) bumpProgress("heldFullEver");
    }
    setApplications((prev) => prev.filter((x) => x.id !== a.id));
  }

  function confirmApplied(a: JobApplication) {
    if (budgetSpent) return;
    patchApp(a.id, { status: "applied" });
    bumpProgress("appliedEver");
    if (a.reviewAfter <= now) bumpProgress("heldFullEver");
    const newCount = vault.appliedToday + 1;
    setVault({
      ...vault,
      appliedToday: newCount,
      appliedDate: today,
    });
    if (newCount >= vault.dailyLimit) {
      setProgress((prev: ProgressState) =>
        prev.budgetSpentDates.includes(today)
          ? prev
          : {
              ...prev,
              budgetSpentDates: [...prev.budgetSpentDates, today],
            },
      );
    }
  }

  function patchMail(id: string, patch: Partial<InboxEmail>) {
    setInbox((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }

  function readMail(m: InboxEmail) {
    // `now` is the component's clock state (mount + per-minute refresh);
    // clicks can only happen after mount, so it is always set here.
    if (!m.readAt) patchMail(m.id, { readAt: now });
    setOpenEmailId(m.id);
  }

  // --- Sign-in gate (simulated for this demo build) ---
  if (sessionReady && guestReady && !session && !guest) {
    return (
      <SignIn
        onSignedIn={(email) =>
          setSession({ email, signedInAt: Date.now() })
        }
        onContinueAsGuest={() => setGuest(true)}
      />
    );
  }

  const provider = config?.mock ? undefined : mode;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-[2rem] font-semibold leading-tight text-stone-800">
            Black Box <span aria-hidden="true">🦥</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {session ? (
              <>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600">
                  {session.email}
                </span>
                <button
                  onClick={() => {
                    setSession(null);
                    setGuest(false);
                  }}
                  className="px-1 text-stone-500"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setGuest(false)}
                className="rounded-full border border-stone-300 bg-white px-3 py-1"
              >
                Sign in with email
              </button>
            )}
          </div>
        </div>
        {now > 0 && (
          <p className="font-display mt-2 text-xl italic text-stone-600">
            {new Date(now).getHours() < 12
              ? "Good morning."
              : new Date(now).getHours() < 18
                ? "Good afternoon."
                : "Good evening."}{" "}
            Take your time — that&rsquo;s the whole idea.
          </p>
        )}
        <p className="mt-1 text-stone-500">
          A job search app that slows you down on purpose. Your data lives in
          this browser; nothing is tracked or uploaded.
        </p>
        {/* Privacy mode — real, wired to the API routes. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Privacy mode:</span>
          {config?.mock ? (
            <span className="rounded-full bg-[#fcf3dc] px-3 py-1 text-[#77620f]">
              Mock mode — no model is being called
            </span>
          ) : (
            <>
              <div
                className="inline-flex rounded-full border border-stone-300 bg-white p-0.5"
                role="group"
                aria-label="Privacy mode"
              >
                <button
                  onClick={() => pickMode("local")}
                  aria-pressed={mode === "local"}
                  className={`rounded-full px-3 py-1 ${
                    mode === "local"
                      ? "bg-[#4338ca] text-white"
                      : "text-stone-600"
                  }`}
                >
                  Private — local Gemma
                </button>
                <button
                  onClick={() =>
                    config?.hosted.configured && pickMode("hosted")
                  }
                  aria-pressed={mode === "hosted"}
                  disabled={!config?.hosted.configured}
                  title={
                    config?.hosted.configured
                      ? "Use the hosted Gemma endpoint"
                      : "This server has no hosted Gemma key configured"
                  }
                  className={`rounded-full px-3 py-1 ${
                    mode === "hosted"
                      ? "bg-[#4338ca] text-white"
                      : "text-stone-600"
                  } disabled:opacity-40`}
                >
                  Demo — hosted Gemma
                </button>
              </div>
              <span className="text-xs text-stone-400">
                {mode === "local"
                  ? "Reframe and score text goes to the Gemma running on this machine, nowhere else."
                  : "Demo mode sends reframe and score text to the hosted provider for that call."}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Daily budget */}
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_10px_36px_rgb(87_83_78/0.10)]">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Applications today
        </h2>
        <p className="mt-1 text-2xl font-bold">
          {vaultReady ? vault.appliedToday : "…"}{" "}
          <span className="text-base font-normal text-stone-500">
            of {vault.dailyLimit} used today
          </span>
        </p>
        <div
          className="mt-3 flex gap-1.5"
          role="progressbar"
          aria-valuenow={vault.appliedToday}
          aria-valuemax={vault.dailyLimit}
          aria-label="Daily application budget"
        >
          {Array.from({ length: Math.max(1, vault.dailyLimit) }).map(
            (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < vault.appliedToday ? "bg-[#4338ca]" : "bg-stone-100"
                }`}
              />
            ),
          )}
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
            className="w-16 rounded-lg border border-stone-300 px-2 py-1"
          />
        </label>
        {budgetSpent && (
          <p className="mt-2 text-sm text-[#4338ca]">
            Budget spent. That&apos;s the whole job for today — the rest of
            the day is yours.
          </p>
        )}
      </section>

      <AddJob
        provider={provider}
        onSavedDraft={() => bumpProgress("draftsEver")}
        onScored={() => bumpProgress("scoresEver")}
      />

      {/* Inbox summary — full inbox lives inside the vault */}
      <section className="rounded-[2rem] bg-[#f1edfb] p-6 shadow-[0_10px_36px_rgb(87_83_78/0.08)]">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Application email
        </h2>
        {session ? (
          <>
            <p className="mt-1 text-lg font-semibold">
              {unreadCount > 0
                ? `${unreadCount} email${unreadCount === 1 ? "" : "s"} waiting in your vault`
                : "Nothing new is waiting in your vault"}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Application email arrives into Black Box and is only shown
              during your daily vault window — never as a push, never as a
              badge you have to clear.
              {heldMail.length > 0 &&
                ` ${heldMail.length} more arrived after the window and is held for the next one.`}{" "}
              This demo inbox holds sample messages; no real mail is
              fetched.
            </p>
            <a
              href="#vault"
              className="mt-3 inline-block rounded-full border border-stone-300 px-5 py-2 text-sm"
            >
              Review in today&apos;s vault
            </a>
          </>
        ) : (
          <>
            <p className="mt-1 text-lg font-semibold">
              Bring your application email into the box
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Sign in with email and application messages land here instead
              of your regular inbox — read once a day, inside the vault, on
              your terms.
            </p>
            <button
              onClick={() => setGuest(false)}
              className="mt-3 rounded-full bg-[#4338ca] px-5 py-2 text-sm font-semibold text-white"
            >
              Sign in with email
            </button>
          </>
        )}
      </section>

      {/* The Vault */}
      <section
        id="vault"
        className="rounded-[2rem] bg-white p-6 shadow-[0_10px_36px_rgb(87_83_78/0.10)]"
      >
        <h2 className="font-display text-xl font-semibold text-stone-800">The Vault</h2>
        {!open && !gating && (
          <>
            <p className="mt-1 text-sm text-stone-500">
              Statuses and inbox mail stay shut until your daily opening.
              Checking more often changes nothing — it only costs attention.
            </p>
            <button
              onClick={() => setGating(true)}
              className="mt-3 rounded-full bg-[#4338ca] px-5 py-2 text-sm font-semibold text-white"
            >
              Begin today&apos;s opening
            </button>
          </>
        )}
        {gating && <BreathingGate onDone={openVault} />}
        {open && (
          <>
            <p className="mt-1 text-sm text-[#4338ca]">
              Open for today. Everything here waited on purpose. It closes
              again at midnight.
            </p>

            {session && (
              <>
                <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Application email inbox
                </h3>
                {availableMail.length === 0 && heldMail.length === 0 && (
                  <p className="mt-2 text-sm text-stone-500">
                    No application email yet.
                  </p>
                )}
                <ul className="mt-2 space-y-3">
                  {availableMail.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-xl bg-stone-50 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{m.from}</span>
                        <span className="text-xs text-stone-500">
                          {new Date(m.receivedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5">{m.subject}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CHIP[m.status]}`}
                        >
                          {STATUS_LABEL[m.status]}
                        </span>
                        {!m.readAt && (
                          <span className="text-xs text-stone-500">
                            Unread
                          </span>
                        )}
                        <button
                          onClick={() => readMail(m)}
                          className="text-sm text-[#4338ca]"
                        >
                          Read when ready →
                        </button>
                      </div>
                    </li>
                  ))}
                  {heldMail.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-xl bg-stone-50 p-3 text-sm opacity-60"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{m.from}</span>
                        <span className="text-xs text-stone-500">
                          {new Date(m.receivedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5">{m.subject}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        Held for the next window — it arrived after
                        today&apos;s.
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {applications.length === 0 && (
              <p className="mt-3 text-sm text-stone-500">
                Nothing tracked yet. Add a job above and it will wait here,
                quietly, in its 48-hour hold.
              </p>
            )}

            {drafts.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Ready to decide
                </h3>
                <ul className="mt-2 space-y-3">
                  {drafts.map((a) => {
                    const ready = a.reviewAfter <= now;
                    return (
                      <li
                        key={a.id}
                        className="rounded-xl bg-stone-50 p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-medium">
                            {a.role} · {a.company}
                            {a.qualityScore != null && (
                              <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-900">
                                Fit {a.qualityScore}/10
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-stone-500">
                            {ready
                              ? "Ready to review"
                              : hoursLeft(a.reviewAfter, now)}
                          </span>
                        </div>
                        {ready && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => confirmApplied(a)}
                              disabled={budgetSpent}
                              className="rounded-full bg-[#4338ca] px-4 py-1.5 font-semibold text-white disabled:opacity-40"
                            >
                              I applied — count it
                            </button>
                            <button
                              onClick={() => removeApp(a)}
                              className="rounded-full bg-stone-200 px-4 py-1.5"
                            >
                              Let it go
                            </button>
                            {budgetSpent && (
                              <span className="text-xs text-stone-500">
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
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Applied
                </h3>
                <ul className="mt-2 divide-y divide-stone-100 text-sm">
                  {active.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span>
                        {a.role} · {a.company}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-stone-500">
                          {a.status === "no-response-yet"
                            ? "No response yet"
                            : "Applied"}
                        </span>
                        {a.status === "applied" && (
                          <button
                            onClick={() =>
                              patchApp(a.id, { status: "no-response-yet" })
                            }
                            className="rounded-full bg-stone-100 px-3 py-1 text-xs"
                          >
                            Mark: no response yet
                          </button>
                        )}
                        <button
                          onClick={() => patchApp(a.id, { status: "closed" })}
                          className="rounded-full bg-stone-100 px-3 py-1 text-xs"
                        >
                          Outcome received
                        </button>
                        <button
                          onClick={() => removeApp(a)}
                          aria-label={`Remove ${a.company}`}
                          className="rounded-full bg-stone-100 px-2 py-1 text-xs"
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
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Closed
                </h3>
                <ul className="mt-2 divide-y divide-stone-100 text-sm text-stone-400">
                  {closed.map((a) => (
                    <li key={a.id} className="flex justify-between py-2">
                      <span>
                        {a.role} · {a.company}
                      </span>
                      <button
                        onClick={() => removeApp(a)}
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

      {openEmail && (
        <InboxEmailView
          email={openEmail}
          provider={provider}
          onReframed={() => bumpProgress("reframesEver")}
          onBack={() => setOpenEmailId(null)}
          onStatus={(s) => patchMail(openEmail.id, { status: s })}
          onRemove={() => {
            setInbox((prev) => prev.filter((m) => m.id !== openEmail.id));
            setOpenEmailId(null);
          }}
        />
      )}

      {/* Mood check-in — a scale, Voda-style */}
      <MoodScale
        value={todaysMood?.mood ?? null}
        onPick={pickMood}
        last7={last7}
      />

      <ProgressCards ctx={achievementCtx} />

      <ReframePanel
        provider={provider}
        onReframed={() => bumpProgress("reframesEver")}
      />

      <footer className="pb-6 text-center text-xs text-stone-400">
        Slow and steady. Built with Gemma 4, an open-weight model, for
        Hacktoberfest Week 3. UX designed in Google Stitch, rebuilt toward
        a Voda-inspired pastel theme.
      </footer>
    </main>
  );
}
