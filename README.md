# Training System

Personal gym training app — Push/Pull/Legs split with a live workout mode, guided stretching, progress tracking, nutrition logging and a growth/mobility protocol. Installable on your phone and works offline at the gym.

## What it does

- **Today** — knows what day it is. Shows today's workout with auto-calculated targets for every exercise, the week at a glance, your streak, body weight vs goal, and the daily protocol checklist (creatine, dead hangs, deep squat, thoracic mobility, sleep) with protein and water tracking.
- **Live workout mode** — log every set with steppers, tick it off, and the rest timer starts automatically (chime + vibration when it's done, survives the phone locking). Weight changes carry forward to your remaining sets, finished exercises auto-advance, barbell lifts show exactly which plates to load, and the screen stays awake.
- **Progressive overload engine** — reads your last session. Hit the top of the rep range on every set? It bumps the load by the increment your plan prescribes. Otherwise it pre-fills last time's numbers and tells you to beat one rep.
- **PRs + summary** — finishing a workout shows time, sets, volume and any new estimated-1RM personal records (with confetti). Bodyweight gains alone never count as a PR.
- **Guided stretching** — every post-workout routine runs as a timer: get-ready countdown, holds, "switch sides" prompts, rep-based moves. Completing it ticks the matching daily habits.
- **Progress** — GitHub-style training calendar, body-weight trend with goal line and a projected date for hitting 73kg (plus lean-bulk pace coaching), estimated-1RM charts for every lift, and full session history.
- **Fuel** — tap any meal from the plan to log its calories and protein, quick-add buttons, macro targets, nutrition rules, creatine guide and creatine streak.
- **Guide** — weekly schedule, flex-day playbook, growth protocol, a plate calculator, theme settings, install instructions, and backup/restore.

All data lives in your browser's local storage — no account, no server. Use **Guide → App → Export** to back it up or move it to another phone.

## Stack

- React 19 + Vite
- Zero runtime dependencies beyond React — charts, heatmap, confetti, barbell and icons are hand-built SVG/canvas
- PWA: web manifest + network-first service worker (always serves the latest deploy when online, falls back to cache offline)

## Project layout

```
src/
  data/plan.js        ← the whole training plan (edit this to change the program)
  lib/                ← parsing, progression/PR math, persistence, timers, sound
  components/         ← UI kit, charts, heatmap, barbell, confetti, icons
  screens/            ← Today, Train, Stats, Fuel, Guide, WorkoutMode, StretchMode
  styles.css          ← design tokens (dark + light) and all styles
public/               ← icons, manifest, service worker
```

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework preset will auto-detect as **Vite** — no config needed
4. Click Deploy

Every push to the connected branch redeploys automatically.
