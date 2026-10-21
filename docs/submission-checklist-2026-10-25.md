# Black Box — submission checklist (DEV Hacktoberfest Week 3)
**Deadline: Sun Oct 25, 2026, 11:59 PM PDT (= Mon Oct 26, 1:59 AM CDT). Working target: submit Sun by 8 PM PDT.**
Live app: https://black-box-sy5x.onrender.com · Demo route: /demo · Repo: github.com/Mike-Demo/black-box

## Already done (verified Oct 20)
- [x] App live on Render, hosted Gemma paid model (google/gemma-4-31b-it) configured and real-model tested on production (reframe + score)
- [x] Demo account shipped (/demo seeds a week of sample data; full walkthrough verified 10 of 10 progress cards)
- [x] Demo video recorded: docs/black-box-demo.mp4 (82s, 3 MB, real production walkthrough)
- [x] Pexo full demo + cover DONE Oct 20 eve (project 60937530578): 100s 16:9 video, August v2 narration, full breathing gate kept at Demo's direction, subtitles burned in, final cover PNG with tagline period removed; files in ~/workspace/black-box/pexo/. Revision in production as of Oct 20 ~8:00 PM CT for a weird image flash right before the vault opens + a 4K upscale — and a separate 60s breathing-exercise cover video (River narration, animated hanging sloth, 4K) also in production. Neither revision changes the checklist below; the 100s final is already usable for the DEV upload if a revision stalls.
- [x] DEV draft written in the official template (docs/dev-post-draft.md), demo URL wired in, hosted-demo disclosure honest
- [x] README + architecture doc current (simulated login + sample mail disclosed; MS Inclusive Design references cited)

## Only Demo can do these
- [ ] **Use the app for real Thu–Fri (Oct 22–23)** — the Lazy Payoff section of the DEV draft needs real-use numbers; the seeded demo data is sample content and is explicitly NOT a substitute
- [x] **DEV post PUBLISHED by Demo 2026-10-20** — https://dev.to/mpmike/i-built-a-job-search-app-that-fights-you-back-because-slow-and-steady-is-the-only-strategy-that-3mc4 (live within the challenge window). Remaining edits happen in the DEV editor: fill The Lazy Payoff (currently reads "Will fill out on Sunday") after Thu–Fri use, and add the agent-session link / My Agent Session section if wanted — the published version currently carries the Copilot video under Prize Categories instead.
- [x] **Demo videos — DONE 2026-10-20** — superseded by YouTube: the walkthrough, the breathing minute, and the three 30s category shorts (Gemma / Render / Copilot) are all published on YouTube and embedded in the draft via {% embed %}; no DEV-editor upload needed.
- [x] **Render paid upgrade — DONE 2026-10-20** — Demo upgraded the live service to the $7/mo Starter plan using free credits; the demo is always on for judging (no spin-down, no wake wait). README, draft, and render.yaml updated to match.

## Cane can do on a yes
- [ ] Fill the Lazy Payoff numbers into the draft from Demo's real-use notes
- [ ] Final pass on the draft (links, demo URL, video placement) before Demo publishes
- [ ] Post-submit: verify the DEV post is live and the demo link inside it resolves

## Known non-blockers
- Local Ollama path (gemma4:e4b) still untested on Demo's machine — the hosted demo is the judged path and is disclosed as such; this does not block submission

_Prepared 2026-10-20 evening from the Black Box project record. Nothing here is new scope — it consolidates the open items already on file so Sunday is a publish, not a scramble._
