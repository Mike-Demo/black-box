# Black Box — final pre-submission code review

Review scope: full repository, with emphasis on the core mechanics, model/API layer, rendering safety, product claims, demo path, accessibility, and deployment surface.

## Findings

### 1. Major — The hosted demo offers a “Private — local Gemma” mode that is not local to the user

**Evidence:** `/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:319-329` always renders an enabled local-mode button, while `/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:351-353` says the text goes to Gemma running “on this machine.” The selected provider is sent to the server route (`/home/runner/work/black-box/black-box/src/app/api/reframe/route.ts:23-38`); local inference then calls `OLLAMA_BASE_URL` from server code (`/home/runner/work/black-box/black-box/src/lib/gemma.ts:57-71`). On the hosted Render deployment, selecting “local” therefore sends the request to the Render service’s own localhost, not the user’s device.

**Smallest fix:** Do not offer or describe local mode as available in the hosted deployment unless inference can actually run on the user’s device. Otherwise, make it unavailable there and explain that local inference requires a locally run app/Ollama.

### 2. Major — The daily budget can be raised after it has been spent

**Evidence:** `/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:389-405` leaves the daily-limit input editable at all times and updates `dailyLimit` immediately. `budgetSpent` is recalculated from the new value at lines 95 and 406-410, and the apply action is disabled only while that value is true (`/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:597-601`). A user can spend a limit of 1, raise it to 2, and apply again that day, contrary to the “stops for the day” claim.

**Smallest fix:** Freeze the day’s limit once applications have been counted, or store a per-day budget snapshot that cannot be increased after use.

### 3. Major — Public inference endpoints have no visible rate or input-size limits

**Evidence:** `/home/runner/work/black-box/black-box/src/app/api/reframe/route.ts:17-24` and `/home/runner/work/black-box/black-box/src/app/api/score/route.ts:18-33` only require non-empty strings. Both routes call the configured provider without a request-size check or rate limit (`/home/runner/work/black-box/black-box/src/app/api/reframe/route.ts:37-38`; `/home/runner/work/black-box/black-box/src/app/api/score/route.ts:43-48`). The Render Blueprint configures a paid hosted model (`/home/runner/work/black-box/black-box/render.yaml:22-34`).

**Smallest fix:** Apply strict input-size limits and per-client/server-side rate limits before forwarding requests to the paid provider; add an overall usage cap for the hosted deployment.

### 4. Major — The reframe prompt asks for advice despite the “no advice” contract

**Evidence:** `/home/runner/work/black-box/black-box/src/lib/prompts.ts:31` requires a concrete action the reader “could take” and gives advice-like examples (“Archive this application” and “Reply asking whether feedback is available”). The review contract calls for no advice.

**Smallest fix:** Remove the suggested-action field, or constrain it to an action explicitly stated in the source message rather than a model-generated recommendation; align the UI and documentation with that behavior.

### 5. Major — Model output is trusted without runtime shape validation

**Evidence:** The TypeScript generic passed to `parseModelJson` is only a compile-time assertion (`/home/runner/work/black-box/black-box/src/app/api/reframe/route.ts:39-54`; `/home/runner/work/black-box/black-box/src/app/api/score/route.ts:49-59`). The reframe view assumes `known` and `unknown` are arrays and calls `.map()` (`/home/runner/work/black-box/black-box/src/components/ReframeResultView.tsx:51-64`); the score view similarly calls `.map()` on `reasons` (`/home/runner/work/black-box/black-box/src/components/AddJob.tsx:177-180`). A syntactically valid but wrongly shaped model reply can reach the client and crash rendering. The score route also clamps a value without confirming it is a finite number or an integer.

**Smallest fix:** Validate each parsed response at runtime, including required field types and score range, and return a controlled upstream error for invalid output instead of returning it as success.

### 6. Major — An earned progress card can disappear after its source email is removed

**Evidence:** The “Read in the window” card is earned from the current count of inbox entries with `readAt` (`/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:113-118`; `/home/runner/work/black-box/black-box/src/lib/achievements.ts:78-83`). Removing a read email deletes it from the inbox (`/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:707-709`), so that count can return to zero. The card display uses the current predicate rather than the persisted `earnedAt` value (`/home/runner/work/black-box/black-box/src/components/ProgressCards.tsx:27-30,66-73`), contradicting “Nothing here can be lost.”

**Smallest fix:** Base this achievement on a monotonic persisted progress event/count (or treat a persisted `earnedAt` as permanently earned), not on the current contents of a removable inbox.

### 7. Major — Seeded demo history is not marked as sample data after the demo redirect

**Evidence:** `/home/runner/work/black-box/black-box/src/lib/demo.ts:41-115` seeds application and mood history without a sample/provenance field. The dashboard renders application rows without a sample label (`/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:574-595`), while mood and progress cards are rendered from the seeded state without identifying it as sample history (`/home/runner/work/black-box/black-box/src/components/Dashboard.tsx:714-719`; `/home/runner/work/black-box/black-box/src/components/ProgressCards.tsx:26-74`). The `/demo` page's sample-data notice is only shown before its full-page redirect (`/home/runner/work/black-box/black-box/src/app/demo/page.tsx:17-26`). As a result, seeded history is indistinguishable from user-entered activity once it appears in the app.

**Smallest fix:** Preserve a demo/sample marker for seeded applications, moods, and progress, and display a persistent sample-data notice wherever those records are shown.

### 8. Major — “Sample data … never leaves your browser” is overbroad for the hosted demo

**Evidence:** `/home/runner/work/black-box/black-box/README.md:7` says the demo’s sample data “never leaves your browser.” The seeded inbox includes a sample outcome message (`/home/runner/work/black-box/black-box/src/lib/demo.ts:117-166`); opening it and choosing the reframe sends its body to `/api/reframe` (`/home/runner/work/black-box/black-box/src/components/InboxEmailView.tsx:45-53`), whose configured hosted provider forwards it upstream (`/home/runner/work/black-box/black-box/src/lib/gemma.ts:81-95`). The hosted call is disclosed elsewhere, but this absolute claim contradicts that behavior.

**Smallest fix:** Qualify the claim: seeded data stays in the browser unless the user explicitly requests hosted Gemma inference, in which case the selected text is sent to the hosted provider.

### 9. Major — The draft says there are only two server routes, but there are three

**Evidence:** `/home/runner/work/black-box/black-box/docs/dev-post-draft.md:61` says “The only server code is two stateless API routes” and names `/api/reframe` and `/api/score`. `/home/runner/work/black-box/black-box/src/app/api/config/route.ts:8-20` is a third server route.

**Smallest fix:** Change the wording to “two model-inference routes plus a read-only `/api/config` route.”

### 10. Minor — Muted small text in the pastel theme has insufficient contrast

**Evidence:** `text-stone-400` is used for small text in `/home/runner/work/black-box/black-box/src/components/MoodScale.tsx:40-41,75` and `/home/runner/work/black-box/black-box/src/components/ProgressCards.tsx:18-19,66`. Tailwind’s `#a8a29e` stone-400 against the cream background `#faf6f0` is approximately 2.34:1, below the 4.5:1 WCAG AA target for normal-size text.

**Smallest fix:** Darken the muted-text color used for small text and verify it against each pastel card background.

### 11. Minor — Provider requests have no application-level timeout

**Evidence:** Both local and hosted paths call `fetch` without an abort signal or timeout (`/home/runner/work/black-box/black-box/src/lib/gemma.ts:57-71,81-96`). The UI remains in its busy state until the request settles (`/home/runner/work/black-box/black-box/src/components/AddJob.tsx:46-63`; `/home/runner/work/black-box/black-box/src/components/InboxEmailView.tsx:45-63`).

**Smallest fix:** Bound provider calls with an abort timeout and return a clear timeout error so the UI can leave its busy state predictably.

## Validation notes

- `npx tsc --noEmit` passed.
- `npm run lint` failed on the existing `react-hooks/set-state-in-effect` error at `/home/runner/work/black-box/black-box/src/components/SiteFooter.tsx:48`; it also reported 35 warnings, primarily in the bundled CO2.js files.
- `npm run build` could not fetch the Google-hosted Fraunces and Geist fonts from `fonts.googleapis.com` in this sandbox. This is an environment/network failure, not a source compilation finding.
- The current GitHub Actions run is still in progress; the job-log endpoint returned HTTP 404 while it was running.

## Verdict

**DO NOT SHIP**
