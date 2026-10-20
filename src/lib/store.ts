"use client";

// Tiny localStorage-backed store. All Black Box user data lives here, in
// the browser, on the user's machine. Nothing is sent to a server except
// the text of an explicit Gemma action (reframe / score), which is
// stateless and disclosed in the UI.

import { useCallback, useEffect, useState } from "react";
import type {
  InboxEmail,
  JobApplication,
  MoodEntry,
  ProgressState,
  SessionState,
  VaultState,
} from "./types";

const KEYS = {
  applications: "blackbox.applications.v1",
  mood: "blackbox.mood.v1",
  vault: "blackbox.vault.v1",
  profile: "blackbox.profile.v1",
  session: "blackbox.session.v1",
  inbox: "blackbox.inbox.v1",
  guest: "blackbox.guest.v1",
  progress: "blackbox.progress.v1",
} as const;

export function todayLocal(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full/blocked: the app degrades to in-memory state.
  }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // One-time hydration from localStorage after mount (client-only store).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(read(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );
  return { value, update, hydrated };
}

export function useApplications() {
  return useStored<JobApplication[]>(KEYS.applications, []);
}

export function useMood() {
  return useStored<MoodEntry[]>(KEYS.mood, []);
}

export function useProfile() {
  return useStored<string>(KEYS.profile, "");
}

export function useSession() {
  return useStored<SessionState | null>(KEYS.session, null);
}

/** "Continue without signing in" — remembered so it isn't asked daily. */
export function useGuest() {
  return useStored<boolean>(KEYS.guest, false);
}

/**
 * Sample inbox, seeded on first run only. This build fetches NO real mail:
 * these are fictional demo messages so the vault inbox can be exercised.
 * Received times are relative to first run so one message always demos
 * the "arrived after the window — held for the next one" rule.
 */
function seedInbox(now = Date.now()): InboxEmail[] {
  const h = 60 * 60 * 1000;
  return [
    {
      id: "demo-mail-northwind",
      from: "Northwind Cloud Talent",
      subject: "Update on your application for Director of Partnerships",
      body: "Dear Demo,\n\nThank you for applying for the Director of Partnerships role and for speaking with our team last week. After careful consideration, we have decided to move forward with another candidate whose experience more closely matches our current needs.\n\nWe will keep your resume on file for future openings. We wish you the best in your search.\n\n— Talent Team, Northwind Cloud",
      receivedAt: now - 26 * h,
      status: "waiting",
      demo: true,
    },
    {
      id: "demo-mail-meridian",
      from: "Meridian Systems Recruiting",
      subject: "Application received: Head of Strategic Alliances",
      body: "Hello Demo,\n\nThank you for your application for the Head of Strategic Alliances role. Your application has been received and is with the hiring team.\n\nNo action is needed from you at this stage. We will contact you if your experience matches what the team is looking for.\n\n— Meridian Systems Recruiting",
      receivedAt: now - 50 * h,
      status: "no-response-yet",
      demo: true,
    },
    {
      id: "demo-mail-larkspur",
      from: "Larkspur Health Hiring",
      subject: "Next step: a conversation with the hiring team",
      body: "Hi Demo,\n\nThank you for applying for the Director of Partner Programs role. The hiring team would like to invite you to a 30-minute conversation next week.\n\nThis message arrived outside your vault window, so Black Box held it here for the next one — there is nothing to do until then.\n\n— Larkspur Health Hiring",
      receivedAt: now - 2 * h,
      heldForNextWindow: true,
      status: "next-step",
      demo: true,
    },
  ];
}

export function useInbox() {
  return useStored<InboxEmail[]>(KEYS.inbox, seedInbox());
}

const DEFAULT_PROGRESS: ProgressState = {
  draftsEver: 0,
  appliedEver: 0,
  letGoEver: 0,
  heldFullEver: 0,
  scoresEver: 0,
  reframesEver: 0,
  budgetSpentDates: [],
  openedDates: [],
  earnedAt: {},
};

export function useProgress() {
  return useStored<ProgressState>(KEYS.progress, DEFAULT_PROGRESS);
}

const DEFAULT_VAULT: VaultState = {
  lastOpenedDate: null,
  dailyLimit: 3,
  appliedToday: 0,
  appliedDate: null,
};

export function useVault() {
  const { value, update, hydrated } = useStored<VaultState>(
    KEYS.vault,
    DEFAULT_VAULT,
  );
  // The daily counter belongs to its date; a new day means a fresh budget.
  const today = todayLocal();
  const effective: VaultState =
    value.appliedDate === today
      ? value
      : { ...value, appliedToday: 0, appliedDate: today };
  return { vault: effective, setVault: update, hydrated };
}

/** The vault opens once per calendar day. Before that, statuses stay shut. */
export function vaultIsOpen(vault: VaultState, now = new Date()): boolean {
  return vault.lastOpenedDate === todayLocal(now);
}

export const DRAFT_HOLD_MS = 48 * 60 * 60 * 1000;
