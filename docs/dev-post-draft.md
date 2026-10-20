---
title: "I Built a Job Search App That Fights You Back — Because Slow and Steady Is the Only Strategy That Lasts"
published: false
tags: devchallenge, hf26challenge
---

<!-- DRAFT — not for publication yet.
     Demo reviews this personally before anything goes live on DEV.
     Placeholders to fill after real use + Render deploy:
       [DEMO LINK]  [DEMO VIDEO/GIF]  [LAZY PAYOFF NUMBERS]  [AGENT SESSION LINK]
     Tags are set by the official submission template: devchallenge, hf26challenge only. -->

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

## What I Built

The sloth moves at its own pace. It conserves energy. It survives. It has never once refreshed an applicant portal at 2 a.m.

Black Box is a job search app built in the sloth's honour — which means it is a job search app that deliberately slows you down. Every other tool in this space tries to make you faster: more applications, more alerts, more dashboards to check. Black Box does the opposite, on purpose, with mechanics instead of advice:

- **The Vault.** Your application statuses stay shut until one daily opening, and a short breathing pause (in for 4, hold for 4, out for 4) stands between you and the reveal. Once a day turns out to be enough — the statuses are the same whether you check once or twenty times; only the cost to you changes.
- **A daily application budget.** You set a small number. When it's spent, the app stops for the day, and says so plainly: that's the whole job for today; the rest of the day is yours.
- **A 48-hour draft hold.** A role you add today cannot be marked applied for two days. If it still looks right in 48 hours, it was worth applying to. Most impulse applications don't survive the hold — which is the hold working.
- **A Gemma quality score.** Paste a job description and Gemma scores it 1–10 against *your* stated profile, with its reasons shown. A low score is information, not a verdict.
- **A calm reframe.** Paste a hard-to-read outcome notice. Gemma restates it in plainer words and separates what it actually decided, what it states, what it does *not* say, and one factual next step. Your original text stays on screen, word for word, next to the reframe — the reframe is labelled, and it never replaces the original.
- **An application-email inbox.** Sign in with email and application messages come into Black Box instead of your regular inbox — and then they wait, like everything else here. Mail is only shown inside the daily vault window; anything that arrives after the window is held for the next one. No pushes, no badges, no 9 p.m. rejection ambush. Open a message and you get its original words first, with the Gemma reframe as an optional second reading. **Honest demo note:** in this build the sign-in link is simulated — no email is actually sent and no server account exists — and the inbox holds sample messages, so the whole flow can be exercised end to end. The mechanics (mail waits for your window) are real; a production version connects a real mailbox behind the same screens.
- **A mood check-in on a scale.** A slider from Rough to Good — the shape borrowed from Voda's daily wellbeing check-in — with the word you chose read back in plain language and a quiet 7-day trend. It is self-report only; the app never guesses how you feel. No streaks, no judgement. A mark for today, if you want one.
- **Progress cards.** Achievements, but only for the slow behaviours the app exists to protect: saving a first draft to the hold, waiting the full 48 hours, letting a draft go, spending the budget and then actually stopping, reading mail inside the window. Cards record process, never outcomes — an interview is not a card, and nothing earned can be lost. It is a record of restraint, not a scoreboard.

Who gets to be lazier because of this? Anyone in a long job search who is spending their limited energy on checking instead of living. Black Box's whole job is to give that time back.

## Demo

**Live demo: https://black-box-sy5x.onrender.com** (free Render plan — if it has been quiet, give it a minute to wake)

[DEMO VIDEO/GIF — 2–3 minute walkthrough: add a job → Gemma score → 48-hour hold → breathing gate → vault opening → reframe]

The demo runs in "Demo mode": hosted Gemma 4, clearly labelled in the interface, because Render has no GPU. Run it locally (instructions in the repo) and the same code calls Gemma on your own machine instead — see below.

## Code

{% embed https://github.com/Mike-Demo/black-box %}

## How I Built It

One small Next.js app (App Router, TypeScript, Tailwind). No database. No server accounts. No analytics. Every piece of user data — applications, vault state, budget, mood log, profile, inbox, and the demo session — lives in the browser's local storage, on the user's machine.

The UX was designed before it was restyled: I gave Google Stitch this repo plus the `DESIGN.md` from my open-source [happy-code-library](https://github.com/Mike-Demo/happy-code-library/tree/main/.stitch) (the Web Awesome design system), created the design system in Stitch from that file, and generated the screens — email sign-in, the Today dashboard, the Vault with its inbox, the email reframe detail, and a check-in & progress screen. The design exports live in the repo under `design/`, and the implementation follows them: light surfaces, one loud brand action per view, visible form labels, status chips in factual words. The restyle also replaced the mood emoji with plain words (Rough / Tiring / Neutral / Steady / Good) — plainer is calmer — and a later design pass turned the mood check-in into a gradient scale and added the progress cards, taking the shape of both from Voda's daily check-in and journey cards.

The only server code is two stateless API routes, `/api/reframe` and `/api/score`, which call Gemma through a single provider layer (`src/lib/gemma.ts`) with three paths:

- **Local** — Ollama serving `gemma4:e4b` on the user's machine. The default, and the private path.
- **Hosted** — the same Gemma 4 weights via an OpenAI-compatible endpoint, for the Render demo. Used only when the user (or the deployment) selects it, and labelled wherever it applies.
- **Mock** — a clearly-labelled placeholder provider so the whole interface can be built and tested with no model present.

The prompts are contracts, not vibes. The reframe prompt forbids the model from changing any fact, softening silence into hope or hardening it into rejection, diagnosing, guessing at the reader's feelings, or adding reassurance the source text doesn't support. If the notice doesn't say something, the model must list it under "what it does not say" — never fill it in. Those rules come from an open-source skill I'd already built for exactly this problem, the [mental-health-support skill](https://github.com/Mike-Demo/agent-skills): transformations are display-only and labelled, originals are preserved, facts stay facts.

The score prompt is just as strict in the other direction: score only against what the profile and the description actually state, name omissions as omissions, no flattery and no predictions.

## Why Does Open Innovation Matter?

Because the most sensitive text in a job search should not have to leave your machine to be useful.

An outcome notice, a private profile of what you want next, a log of how the search is going — with a closed API, every one of those has to be shipped to someone else's server before a model can help you read it. With Gemma 4 — open weights, Apache 2.0 — the model comes to the data instead. Black Box in local mode runs the whole loop on the device in front of you, costs nothing per call, works offline, and cannot change its pricing or its terms on you mid-search.

I'll be precise about the limit, because it matters: the public demo can't do that. Render has no GPU, so the demo serves the same Gemma 4 weights from a hosted endpoint, and text you paste there is sent to that provider for the call. The app says so, in the interface, next to the toggle — and the toggle itself only exists because the open weights let one codebase honestly offer both paths. A closed model gives you one path and asks you not to think about it.

## My Agent Session

[AGENT SESSION LINK — DevRelay embed or link]

## The Lazy Payoff

[LAZY PAYOFF NUMBERS — fill after real use Thu–Fri: hours not spent checking, applications the hold stopped, what the budget did to the shape of a day. Only numbers that actually happened.]

## Prize Categories

- Best Use of Gemma — Gemma 4 is the entire intelligence of the app: quality scoring and reframing, run locally via Ollama by default, with the same weights served hosted for the demo and disclosed as such.
- Best Use of Render — the whole app, front end and Gemma API routes, deploys as a single Render web service from the `render.yaml` Blueprint in the repo.

🦥
