// The one-click demo account: seeds a week of realistic SAMPLE data
// into the browser's local storage and signs in as demo@mikedemo.email,
// so anyone — a hackathon judge, a curious reader — can exercise the
// full app immediately: drafts at every hold stage, an inbox with an
// outcome to reframe, six days of mood marks, and progress cards one
// ordinary day away from 10 of 10. Everything is labelled sample data
// (inbox messages carry demo: true), timestamps are relative to the
// moment of seeding, and nothing leaves the browser.

import { todayLocal } from "./store";
import type {
  InboxEmail,
  JobApplication,
  MoodEntry,
  ProgressState,
  SessionState,
  VaultState,
} from "./types";

export const DEMO_EMAIL = "demo@mikedemo.email";

const PROFILE =
  "Partnerships and alliances leader in cloud infrastructure, hosting, and SaaS. Looking for: Head or Director of Partnerships / strategic alliances roles. Strengths: building partner programs from scratch, marketplace and channel go-to-market, partner onboarding, HubSpot and Jira, open-source community ecosystems. Constraints: remote (US), $140k+ base. A decade of partnerships leadership, most recently Partnerships Lead, North America at a hosting provider.";

function writeKey(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app degrades to defaults */
  }
}

export function seedDemoAccount() {
  const now = Date.now();
  const H = 3600e3;
  const D = 24 * H;
  const today = todayLocal();
  const day = (offsetDays: number) =>
    todayLocal(new Date(now + offsetDays * D));

  const applications: JobApplication[] = [
    {
      id: "demo-app-meridian",
      company: "Meridian Systems",
      role: "Head of Strategic Alliances",
      status: "draft",
      createdAt: now - 3 * D,
      reviewAfter: now - 1 * D,
      qualityScore: 8,
      qualityReasons: [
        "The posting asks for alliances leadership in SaaS; your profile names exactly that.",
        "It lists HubSpot as the CRM; your profile states HubSpot fluency.",
        "Remote US role; your constraints say remote US.",
      ],
    },
    {
      id: "demo-app-brightstack",
      company: "Brightstack",
      role: "Director of Channel Partnerships",
      status: "draft",
      createdAt: now - 60 * H,
      reviewAfter: now - 12 * H,
      qualityScore: 7,
      qualityReasons: [
        "Channel partnerships leadership matches your stated strengths.",
        "The posting is remote-first in the US, matching your constraints.",
      ],
    },
    {
      id: "demo-app-larkspur",
      company: "Larkspur Health",
      role: "Director of Partner Programs",
      status: "draft",
      createdAt: now - 5 * H,
      reviewAfter: now + 43 * H,
      qualityScore: 6,
      qualityReasons: [
        "Partner programs is a named strength in your profile.",
        "Healthcare is not named in your profile; the posting prefers healthcare experience.",
      ],
    },
    {
      id: "demo-app-cloudhaven",
      company: "Cloudhaven",
      role: "Director, Ecosystem Partnerships",
      status: "no-response-yet",
      createdAt: now - 6 * D,
      reviewAfter: now - 4 * D,
    },
    {
      id: "demo-app-acme",
      company: "Acme Hosting",
      role: "Partnerships Lead, North America",
      status: "applied",
      createdAt: now - 4 * D,
      reviewAfter: now - 2 * D,
    },
    {
      id: "demo-app-summitline",
      company: "Summitline",
      role: "Head of Partnerships",
      status: "closed",
      createdAt: now - 9 * D,
      reviewAfter: now - 7 * D,
    },
  ];

  const mood: MoodEntry[] = [
    { date: day(-6), mood: 2 },
    { date: day(-5), mood: 3 },
    { date: day(-4), mood: 3 },
    { date: day(-3), mood: 4 },
    { date: day(-2), mood: 3 },
    { date: day(-1), mood: 4 },
  ];

  const inbox: InboxEmail[] = [
    {
      id: "demo-mail-northwind",
      from: "Northwind Cloud Talent",
      subject: "Update on your application for Director of Partnerships",
      body: "Dear Demo,\n\nThank you for applying for the Director of Partnerships role and for speaking with our team last week. After careful consideration, we have decided to move forward with another candidate whose experience more closely matches our current needs.\n\nWe will keep your resume on file for future openings. We wish you the best in your search.\n\n— Talent Team, Northwind Cloud",
      receivedAt: now - 26 * H,
      status: "waiting",
      demo: true,
    },
    {
      id: "demo-mail-cloudhaven",
      from: "Cloudhaven People Team",
      subject: "Next step on Director, Ecosystem Partnerships",
      body: "Hi Demo,\n\nThank you for your application for the Director, Ecosystem Partnerships role. The team was impressed by your partner program background and would like to schedule a 30-minute conversation with the hiring manager next week.\n\nNo preparation is needed. We will send times shortly.\n\n— Cloudhaven People Team",
      receivedAt: now - 8 * H,
      status: "next-step",
      demo: true,
    },
    {
      id: "demo-mail-meridian",
      from: "Meridian Systems Recruiting",
      subject: "Application received: Head of Strategic Alliances",
      body: "Hello Demo,\n\nThank you for your application for the Head of Strategic Alliances role. Your application has been received and is with the hiring team.\n\nNo action is needed from you at this stage. We will contact you if your experience matches what the team is looking for.\n\n— Meridian Systems Recruiting",
      receivedAt: now - 50 * H,
      status: "no-response-yet",
      readAt: now - 26 * H,
      demo: true,
    },
    {
      id: "demo-mail-summitline",
      from: "Summitline Talent",
      subject: "Update on Head of Partnerships",
      body: "Dear Demo,\n\nThank you for your interest in the Head of Partnerships role at Summitline. We have completed our review and will not be moving forward with your application at this time.\n\nWe appreciate the time you took to apply.\n\n— Summitline Talent",
      receivedAt: now - 3 * D,
      status: "outcome",
      readAt: now - 2 * D,
      demo: true,
    },
    {
      id: "demo-mail-larkspur",
      from: "Larkspur Health Hiring",
      subject: "Next step: a conversation with the hiring team",
      body: "Hi Demo,\n\nThank you for applying for the Director of Partner Programs role. The hiring team would like to invite you to a 30-minute conversation next week.\n\nThis message arrived outside your vault window, so Black Box held it here for the next one — there is nothing to do until then.\n\n— Larkspur Health Hiring",
      receivedAt: now - 1 * H,
      heldForNextWindow: true,
      status: "next-step",
      demo: true,
    },
  ];

  const vault: VaultState = {
    lastOpenedDate: day(-1),
    dailyLimit: 3,
    appliedToday: 1,
    appliedDate: today,
  };

  const progress: ProgressState = {
    draftsEver: 5,
    appliedEver: 2,
    letGoEver: 0,
    heldFullEver: 0,
    scoresEver: 5,
    reframesEver: 1,
    budgetSpentDates: [day(-4)],
    openedDates: [day(-5), day(-3), day(-2), day(-1)],
    earnedAt: {
      "first-hold": now - 5 * D,
      "looked-first": now - 5 * D,
      counted: now - 4 * D,
      "budget-stopped": now - 4 * D,
      "read-calmly": now - 3 * D,
      "in-the-window": now - 2 * D,
    },
  };

  const session: SessionState = { email: DEMO_EMAIL, signedInAt: now };

  writeKey("blackbox.session.v1", session);
  writeKey("blackbox.guest.v1", false);
  writeKey("blackbox.profile.v1", PROFILE);
  writeKey("blackbox.applications.v1", applications);
  writeKey("blackbox.mood.v1", mood);
  writeKey("blackbox.inbox.v1", inbox);
  writeKey("blackbox.vault.v1", vault);
  writeKey("blackbox.progress.v1", progress);
}

/** Seed the demo account, then hard-navigate home so the dashboard
 *  hydrates from the freshly written state. */
export function loadDemoAccountAndGo() {
  seedDemoAccount();
  // Deliberate hard navigation (not router.push): every store hook
  // hydrates from localStorage on mount, and a full load guarantees the
  // dashboard reads the state seeded a moment ago.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/");
}
