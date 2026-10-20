# Black Box — UX design (Google Stitch)

> **Current shipped theme (2026-10-20): Version A "pastel daylight"** —
> see *Explorations* below. Demo picked the Voda-inspired pastel
> direction, and the app was rebuilt toward it: warm cream background
> (`#faf6f0`), plum-gray stone text, Fraunces serif display type,
> pastel-tinted cards with big soft shadows, deep indigo (`#4338ca`) as
> the one loud action. The Web Awesome system below was the first
> restyle and remains the layout's skeleton.

The interface was first designed in **Google Stitch** using the
open-source **Web Awesome Design System**:

- Source design system: `happy-code-DESIGN.md` (this folder) — copied from
  [Mike-Demo/happy-code-library/.stitch](https://github.com/Mike-Demo/happy-code-library/tree/main/.stitch)
- Stitch project: **Black Box — Slow and Steady**
  (https://stitch.withgoogle.com/projects/1301580479447903934)
- Design system asset created from the uploaded DESIGN.md:
  `assets/e3f02f268d1e44cc9090ec4fb47ad53d`

## Screens (`stitch/` — exported HTML + screenshot per screen)

| Screen | Stitch title | File |
| --- | --- | --- |
| Email sign-in (simulated link flow) | Black Box - Sign In | `stitch/signin.html` |
| Today dashboard (budget, hold, inbox summary, mood) | Black Box - Today Dashboard | `stitch/dashboard.html` |
| The Vault (inbox, ready-to-decide, reframe) | Black Box - The Vault | `stitch/vault.html` |
| Email detail + Gemma reframe | Black Box - Email Reframe Detail | `stitch/email.html` |
| Mood scale + progress cards | Black Box - Check-in & Progress | `stitch/progress.html` |

The implementation follows these screens: light surfaces (`#f8f9fa`
background, white cards), ink text (`#1b1d26`), quiet text (`#545868`),
one loud brand action (`#0071ec`), success/warning accents (`#00ac49` /
`#fac22b`), thin borders, modest rounding, visible form labels, and
uppercase letter-spaced section kickers.

## Explorations — Voda-native directions

On 2026-10-20 Stitch was asked for two redesigns of the Today dashboard
taking full inspiration from **Voda** (the LGBTQIA+ wellbeing app), with
*no* design system attached. Stitch invented its own theme for the first
("Sanctuary Quietude") and produced:

| Version | Stitch title | File |
| --- | --- | --- |
| A — pastel daylight | Black Box - Today (Voda Wellbeing Aesthetic) | `stitch/voda-a.html` |
| B — dusk | Black Box - Today (Voda Dusk Aesthetic) | `stitch/voda-b.html` |

Both keep the same content (budget, emoji-face mood scale, Deliberate
Milestones, vault) in a much softer visual language — cream backgrounds,
serif greetings, pastel or terracotta/sage tints, pill buttons. **Demo
chose Version A on 2026-10-20 and the app was rebuilt toward it** (see
the note at the top of this file). Version B remains an unimplemented
exploration.
