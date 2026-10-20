// Progress cards: a factual record of the app's own slow behaviours.
// Cards are earned by process — holding, waiting, letting go, reading in
// the window — never by outcomes (an interview is not a card; a rejection
// is not a lost point). No totals beyond "n of 10", no streaks, nothing
// that can be lost.

import type { ProgressState } from "./types";

export interface AchievementContext {
  progress: ProgressState;
  moodDays: number; // distinct days with a mood mark
  inboxRead: number; // inbox emails opened inside the vault
}

export interface Achievement {
  id: string;
  title: string;
  /** Factual one-liner: what earns this card, present tense. */
  how: string;
  /** Two-letter monogram shown on the card's badge. */
  mark: string;
  earned: (c: AchievementContext) => boolean;
  /** Optional quiet counter for unearned cards, e.g. 3 / 5. */
  progress?: (c: AchievementContext) => { n: number; of: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-hold",
    title: "First hold",
    how: "Save a draft to the 48-hour hold.",
    mark: "FH",
    earned: (c) => c.progress.draftsEver >= 1,
  },
  {
    id: "full-wait",
    title: "The full wait",
    how: "Decide on a draft after its whole 48 hours.",
    mark: "FW",
    earned: (c) => c.progress.heldFullEver >= 1,
  },
  {
    id: "let-go",
    title: "Let one go",
    how: "Release a draft instead of applying.",
    mark: "LG",
    earned: (c) => c.progress.letGoEver >= 1,
  },
  {
    id: "counted",
    title: "Counted, on purpose",
    how: "Mark an application applied, inside a vault window.",
    mark: "CP",
    earned: (c) => c.progress.appliedEver >= 1,
  },
  {
    id: "budget-stopped",
    title: "Budget, then stopped",
    how: "Spend a full day's budget — and let that be the day.",
    mark: "BS",
    earned: (c) => c.progress.budgetSpentDates.length >= 1,
  },
  {
    id: "looked-first",
    title: "Looked first",
    how: "Score a job with Gemma before deciding.",
    mark: "LF",
    earned: (c) => c.progress.scoresEver >= 1,
  },
  {
    id: "read-calmly",
    title: "Read it calmly",
    how: "Use a Gemma reframe on a hard message.",
    mark: "RC",
    earned: (c) => c.progress.reframesEver >= 1,
  },
  {
    id: "in-the-window",
    title: "Read in the window",
    how: "Open an inbox email inside the vault.",
    mark: "RW",
    earned: (c) => c.inboxRead >= 1,
  },
  {
    id: "five-windows",
    title: "Five windows",
    how: "Open the vault on 5 different days.",
    mark: "5W",
    earned: (c) => c.progress.openedDates.length >= 5,
    progress: (c) => ({ n: c.progress.openedDates.length, of: 5 }),
  },
  {
    id: "seven-marks",
    title: "Seven marks",
    how: "Mark the day's mood on 7 days.",
    mark: "7M",
    earned: (c) => c.moodDays >= 7,
    progress: (c) => ({ n: c.moodDays, of: 7 }),
  },
];
