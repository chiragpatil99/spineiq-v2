# SpineIQ v2 — Gamified Spine Health Assessment

> **Evidence-based back pain assessment — now with coins, badges and rewards.**

SpineIQ v2 takes the same clinical assessment engine as v1 and wraps it in a gamified experience. Every step you complete earns coins. Finish the quest and unlock badges. The goal: make a potentially intimidating medical assessment feel engaging and motivating.

---

## 🎮 Live Demo

**https://chiragpatil99.github.io/spineiq-v2**

---

## 🪙 Gamification Features

| Feature | Details |
|---|---|
| Coins | Earn 10–30 coins per step (up to 185 total) |
| Step completion overlay | Celebration screen with confetti on every step |
| Coin counter | Live golden counter in the header |
| Badges | 7 unlockable badges (First Step, Halfway, Quest Complete, etc.) |
| Rewards tab | Full achievements screen with badge grid and step breakdown |
| Report coins | Extra 25 coins for generating the AI clinical report |

---

## 📋 Assessment Steps (9 steps)

1. Patient Information
2. Occupation
3. Work Patterns
4. Lifestyle
5. Health Data (Google Fit / manual)
6. Pain Assessment *(video gated)*
7. Radiculopathy & ODI *(video gated)*
8. Red Flag Screening *(video gated)*
9. Functional Status

---

## 🧠 Clinical Engine (same as v1)

- **SSS Score (0–11)** — Spine Severity System clinical scoring
- **5 Dimension Scores** — Lifestyle, Activity, Sleep, Mobility, Weight
- **Back Pain Risk Score (0–100)** — Low / Moderate / High
- **Age-specific benchmarks** — from Dr Ayush Sharma's Daily Habit Snapshot
- **AI Clinical Report** — 8-section evidence-based report via Anthropic Claude

---

## 🏗️ Architecture

```
Browser (GitHub Pages)
  → SpineIQ v2 frontend (static HTML/CSS/JS)
    → Render.com proxy (Node/Express)
      → Anthropic Claude API
```

---

## 📁 Project Structure

```
spineiq-v2/
├── index.html          # App shell
├── css/styles.css      # Gamified UI design system
└── js/
    ├── data.js         # Patient data model
    ├── scoring.js      # SSS + dimension scoring engine
    ├── gamification.js # Coins, badges, confetti, overlays
    ├── pages.js        # 9-step assessment templates
    └── app.js          # App controller
```

---

## 🆚 v1 vs v2

| Feature | v1 Clinical | v2 Gamified |
|---|---|---|
| Theme | Dark/light auto | Bright colourful |
| Navigation | Sidebar | Bottom tabs |
| Rewards | None | Coins + badges |
| Step completion | Silent | Celebration overlay |
| Target user | Clinician-facing | Patient-facing |
| Report | Full clinical | Full clinical + coins |

---

## 🗺️ Roadmap

- [ ] Daily spine check streak
- [ ] Leaderboard
- [ ] Level system (Bronze → Silver → Gold spine guardian)
- [ ] Push notifications for daily reminders
- [ ] Wearable auto-sync (Apple Health, Fitbit)

---

*SpineIQ v2 — Phase 1 Prototype · Built for Friday demo*
