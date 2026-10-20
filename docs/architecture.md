# Black Box — how it works

One rule drives the design: **the app holds your drafts and your limits, so
you don't have to hold the urge.**

```mermaid
flowchart LR
  subgraph Browser["Your browser — all personal data lives here"]
    Dash["Dashboard<br/>daily budget · mood check-in · 7-day trend"]
    Vault["The Vault<br/>one daily window · 4·4·4 breathing gate"]
    AddJob["Add a Job<br/>profile + JD → score → hold"]
    Reframe["Reframe panel<br/>inside the vault"]
    Store[("On-device browser storage<br/>drafts + 48h expiry · budget · mood · profile · inbox · demo session<br/>No server account. No database.")]
    Dash --- Store
    Vault --- Store
    AddJob --- Store
    Reframe --- Store
  end

  subgraph Render["Black Box on Render — stateless"]
    Config["/api/config<br/>reports available modes"]
    ScoreAPI["/api/score<br/>profile + JD → score + reasons"]
    ReframeAPI["/api/reframe<br/>original + plain words + known/unknown"]
    Note["Validates, calls Gemma, returns JSON.<br/>Stores nothing. Every call starts from zero."]
  end

  subgraph Gemma["Gemma 4 — Privacy Mode picks the road, per request"]
    Local["PRIVATE · Ollama on your machine<br/>gemma4:e4b — text never leaves your device"]
    Hosted["DEMO · OpenRouter<br/>Gemma 4 31B — labelled 'Demo mode'"]
  end

  AddJob -->|score request| ScoreAPI
  Reframe -->|reframe request| ReframeAPI
  ScoreAPI --> Gemma
  ReframeAPI --> Gemma
```

Whichever inference road ran is printed on every result. No silent
substitutions.

## A day with Black Box

```mermaid
flowchart TD
  A0["0 · Sign in with email (simulated in the demo)<br/>application email now lands in the box, not your inbox"]
  A["1 · Find a job<br/>paste the JD — Gemma scores the fit, with reasons"]
  B["2 · Save it — don't send it<br/>the draft enters the 48-hour hold"]
  C["3 · Walk away<br/>nothing to refresh; the app holds the draft"]
  D["4 · Once a day, breathe<br/>4·4·4, then the vault opens in your window"]
  E["5 · Decide on purpose<br/>'I applied — count it' spends 1 daily budget<br/>budget spent = done for today"]
  F["6 · When news arrives<br/>Reframe: original verbatim + plain words<br/>+ facts split known vs unknown"]
  A0 --> A
  A --> B --> C --> D --> E --> F
  F -.->|tomorrow| D
```
