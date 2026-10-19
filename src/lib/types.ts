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

export interface VaultState {
  lastOpenedDate: string | null; // YYYY-MM-DD (local) of last vault opening
  dailyLimit: number; // applications allowed per day
  appliedToday: number;
  appliedDate: string | null; // date the appliedToday counter belongs to
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
