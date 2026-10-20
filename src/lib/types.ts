// Black Box — core types. All user data lives in the browser (localStorage).
// The server only performs stateless Gemma inference; it stores nothing.

export type ApplicationStatus =
  | "draft" // in the 48-hour hold
  | "applied"
  | "no-response-yet"
  | "closed"; // an outcome was received (wording stays factual in the UI)

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  url?: string;
  status: ApplicationStatus;
  createdAt: number; // epoch ms
  reviewAfter: number; // draft hold: createdAt + 48h
  qualityScore?: number; // 1-10, from Gemma
  qualityReasons?: string[];
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD (local)
  mood: 1 | 2 | 3 | 4 | 5;
}

/**
 * Demo sign-in session. The sign-in link flow is SIMULATED in this build:
 * no email is sent and no server account exists. The session is just the
 * email address the user typed, kept in this browser like everything else.
 */
export interface SessionState {
  email: string;
  signedInAt: number; // epoch ms
}

export type InboxEmailStatus =
  | "waiting" // arrived, not yet read in a vault window
  | "no-response-yet" // silence, stated plainly — never spun
  | "outcome" // an outcome was received
  | "next-step"; // the sender proposed a next step

export interface InboxEmail {
  id: string;
  from: string;
  subject: string;
  /** Full message text. Shown verbatim; a reframe never replaces it. */
  body: string;
  receivedAt: number; // epoch ms
  /**
   * Arrived after the current vault window: the inbox holds it until the
   * next window instead of surfacing it immediately.
   */
  heldForNextWindow?: boolean;
  status: InboxEmailStatus;
  readAt?: number; // epoch ms, set when opened inside the vault
  /** Seeded sample mail for the demo inbox (no real mail is fetched). */
  demo?: boolean;
}

export interface VaultState {
  lastOpenedDate: string | null; // YYYY-MM-DD (local) of last vault opening
  dailyLimit: number; // applications allowed per day
  appliedToday: number;
  appliedDate: string | null; // date the appliedToday counter belongs to
}

/**
 * Process record for the Progress cards. Counts the app's own slow
 * behaviours (holding, waiting, letting go, reading in the window) —
 * never outcomes, never points. Earned dates are stamped the first time
 * a card's condition is observed true.
 */
export interface ProgressState {
  draftsEver: number;
  appliedEver: number;
  letGoEver: number;
  heldFullEver: number; // decided on a draft after its full 48h elapsed
  scoresEver: number;
  reframesEver: number;
  budgetSpentDates: string[]; // days the full daily budget was spent
  openedDates: string[]; // days the vault was opened (YYYY-MM-DD)
  earnedAt: Record<string, number>; // achievement id -> epoch ms
}

export interface ReframeResult {
  /** The user's original text, returned verbatim. Never altered server-side. */
  original: string;
  /** A calmer, fact-identical restatement. Labelled as a reframe in the UI. */
  reframed: string;
  facts: {
    /** What the notice actually decided, in plain factual language. */
    decision: string;
    /** Facts the notice states. */
    known: string[];
    /** What the notice does NOT say. Silence stays silence. */
    unknown: string[];
    /** One concrete, factual next step the user could take (or null). */
    nextStep: string | null;
  };
  /** Which inference path produced this: "local" (Ollama) or "hosted". */
  provider: "local" | "hosted" | "mock";
  model: string;
}
