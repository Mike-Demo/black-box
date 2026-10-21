# Security audit backlog — 2026-10-21

Issue creation was unavailable in this session, so the following issue drafts are ready to file. The confirmed finding is prioritized first; it is the only confirmed finding, so there are no shared-root-cause groups.

## 1. Confirmed finding

### Issue title

`[security][medium] Prevent /demo from overwriting existing local data`

### Issue body

Parent: [Security audit 2026-10-21 — prioritize findings and create remediation issues](https://github.com/Mike-Demo/black-box/issues/3)

**Priority:** First (medium). The public `/demo` link is reachable by any visitor, and opening it can irreversibly erase an existing user's sole copy of personal app data. This is the only confirmed finding in the audit.

**Fingerprint:** `demo-link-overwrites-existing-local-data`

**Evidence:** Loading the public `/demo` page runs `seedDemoAccount` on mount. It unconditionally overwrites all eight `blackbox.*.v1` localStorage keys (session, guest, profile, applications, mood, inbox, vault, progress) with sample data and then navigates home. localStorage is the app's sole store, with no database, backup, existing-data check, or confirmation on this path, so an existing user's applications, profile, mood history, inbox, vault, and progress are irreversibly lost when they open the link.

**Root cause:** `seedDemoAccount` in `src/lib/demo.ts` writes all eight keys unconditionally, and `src/app/demo/page.tsx` invokes it on page mount with no existing-data guard, confirmation, or export/backup step.

**Smallest fix:** In `seedDemoAccount`/`loadDemoAccountAndGo`, before any `writeKey`, check whether `blackbox.applications.v1`, `blackbox.profile.v1`, or `blackbox.mood.v1` already hold non-default user data. If so, require explicit confirmation and offer export/backup first; seed only into an empty store without confirmation.

## 2. Needs-validation checklist

### Issue title

`[security][needs-validation] Audit leads to validate`

### Issue body

Parent: [Security audit 2026-10-21 — prioritize findings and create remediation issues](https://github.com/Mike-Demo/black-box/issues/3)

No severity is assigned to these leads. Resolve each by obtaining the exact missing deployment fact from the owner; source inspection alone does not establish it.

- [ ] **'Private - local Gemma' label may not match server-side Ollama topology in a hosted deployment**  
  Fingerprint: `local-privacy-label-mismatch-server-ollama`  
  Claimed root cause: The 'local' inference path terminates on the server host via a server-side fetch to `OLLAMA_BASE_URL`, while the UI labels it as on-device/private without gating the label on the actual deployment topology.  
  **Exact missing fact:** Whether any real hosted/shared (multi-user) deployment of this app co-locates an Ollama reachable at `OLLAMA_BASE_URL` and offers the 'local' mode to visitors - i.e. the owner-observed deployment topology (`OLLAMA_BASE_URL` target and whose machine it runs on). This fact is not present in source.

- [ ] **Unauthenticated `/api/score` and `/api/reframe` may be an unbounded proxy to operator-paid hosted Gemma inference**  
  Fingerprint: `unauthenticated-paid-gemma-proxy-no-limits`  
  Claimed root cause: Unauthenticated route handlers forward unbounded client text to operator-paid hosted inference under the operator's API key, with no in-repo length cap, rate limit, concurrency cap, timeout, or quota accounting.  
  **Exact missing fact as provided in the parent issue:** Owner-observed deployment facts: (1) whether the live Render service is configured as `render.yaml` intends (`GEMMA_PROVIDER=hosted` with a paid `GEMMA_HOSTED_API_KEY` for `google/gemma-4-31b-it`), and (2) whether OpenRouter key limits, Render plan limits, or any WAF/proxy in front of the service impose an effective per-key rate limit or spend cap that bo…  
  **Source limitation:** The parent issue's text ends at `bo…`; the rest of this missing-fact statement was not available in the provided issue text and is not reconstructed here.
