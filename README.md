# Black Box 🦥

**A job search app that slows you down on purpose.**

Built for the [DEV Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19) — build something with open-source AI that rewards laziness.

Every job search tool tries to make you go faster: more applications, more refreshing, more dashboards. Black Box does the opposite. It is named for the flight recorder — the box you only open when it matters — and for the closed lid it puts between you and compulsive status-checking.

## What it does

- **The Vault** — Application statuses stay shut until your one daily opening. A short breathing pause (inhale 4 · hold 4 · exhale 4) stands between you and the reveal. Once a day is enough.
- **A daily application budget** — You set a small daily limit. When it is spent, the app stops for the day. Rest is a feature.
- **A 48-hour draft hold** — New applications sit as drafts for 48 hours before they can be marked applied. If the role still looks right in two days, it was worth applying to.
- **A Gemma quality score** — Paste a job description; Gemma scores it 1–10 against *your* stated profile — roles, skills, constraints — using only what both texts actually say, and shows its reasons.
- **A calm reframe** — Paste a hard-to-read outcome notice. Gemma restates it in plainer words, lists what it actually decided, what it does not say, and one factual next step. The original is always shown alongside, and the reframe is labelled as one. Facts stay facts; silence is never dressed up as hope or as rejection.
- **A mood check-in** — One tap a day, a simple 7-day trend. No streaks, no scores, no judgement.

## Why open innovation matters here

The most sensitive text in a job search — outcome notices, salary anxiety, a private profile of what you want next — should not have to leave your machine to be useful.

Black Box runs **Gemma 4** (Google's open-weight model family, Apache 2.0) **locally via Ollama** by default. In local mode, inference happens on your device; the app has no database, no accounts, and no analytics — your applications, vault state, and mood log live in your browser's local storage.

**Honest disclosure:** the public demo is hosted on Render, which has no GPU, so the demo serves the same Gemma 4 weights through a hosted endpoint. In that mode — labelled **Demo mode** in the interface wherever it applies — the text of a reframe or score request is sent to that provider. Run it locally and nothing leaves your machine. Same code, same prompts, two inference paths, and the app tells you which one you are on.

The reframe guardrails come from the open-source [mental-health-support skill](https://github.com/Mike-Demo/agent-skills): transformations are display-only and labelled, originals are preserved, and the model is forbidden from diagnosing, inferring feelings, or adding reassurance the source text does not support.

## Tech

- Next.js (App Router) + TypeScript + Tailwind CSS — one small codebase
- Gemma 4 (`gemma4:e4b` locally via Ollama; hosted Gemma 4 for the demo)
- No database, no auth — state in browser local storage
- Deployed as a single web service on **Render**

## Run it locally

```bash
# 1. Get Gemma 4 locally
ollama pull gemma4:e4b
ollama serve

# 2. Run the app
npm install
cp .env.example .env.local   # defaults already point at local Ollama
npm run dev                  # http://localhost:3000
```

To run against a hosted Gemma endpoint instead, set in `.env.local`:

```bash
GEMMA_PROVIDER=hosted
GEMMA_HOSTED_API_KEY=your-key
# GEMMA_HOSTED_BASE_URL=https://openrouter.ai/api/v1 (default)
# GEMMA_HOSTED_MODEL=google/gemma-4-31b-it:free (default)
```

For development without any model, `GEMMA_PROVIDER=mock` returns clearly-labelled placeholder responses so the whole interface can be exercised.

## Deploy on Render

The repo ships a Render Blueprint (`render.yaml`): Render Dashboard → New → Blueprint → connect this repo. It creates one web service that builds and runs the whole app, with `GEMMA_PROVIDER=hosted` and a prompt for the one secret it needs (`GEMMA_HOSTED_API_KEY`). Note the free plan spins down when idle — the first visit after a quiet spell takes about a minute to wake.

## Prize categories entered

- Overall — Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady
- Best Use of Gemma
- Best Use of Render

## License

MIT — see [LICENSE](LICENSE).
