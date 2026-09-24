import { DAYS, PROFILE } from "../data/plan";
import { addDays, dayKey, daysBetween, fromKey, mondayOf } from "./dates";
import { parseIncrement, parseSets, parseStart } from "./parse";

export const round = (x) => Math.round(x * 4) / 4;

// Epley estimated one-rep max.
export const e1rm = (load, reps) => (reps <= 0 ? 0 : reps === 1 ? load : load * (1 + reps / 30));

// Bodyweight moves track *added* load; strength math uses bodyweight + added.
export const effLoad = (equip, w, bodyKg) => (equip === "bodyweight" ? bodyKg + w : w);

export function fmtLoad(equip, w) {
  if (equip === "bodyweight") return w ? `BW+${round(w)}` : "BW";
  return `${round(w)}kg`;
}

export function latestBodyKg(weights) {
  if (!weights.length) return PROFILE.startKg;
  return weights.reduce((a, b) => (b.date > a.date ? b : a)).kg;
}

export function findExercise(name) {
  for (const day of Object.values(DAYS)) {
    const ex = day.exercises.find((e) => e.name === name);
    if (ex) return ex;
  }
  return null;
}

// Every logged appearance of an exercise, oldest first, with its best set.
// `atBodyKg` scores every session at one bodyweight, so gaining weight alone never reads as a PR.
export function exerciseHistory(sessions, name, atBodyKg) {
  const out = [];
  for (const s of sessions) {
    const ex = s.exercises.find((e) => e.name === name);
    if (!ex || !ex.sets.length) continue;
    const bodyKg = atBodyKg ?? s.bodyKg ?? PROFILE.startKg;
    let best = null;
    for (const set of ex.sets) {
      const est = e1rm(effLoad(ex.equip, set.w, bodyKg), set.r);
      if (!best || est > best.est) best = { ...set, est };
    }
    out.push({ date: s.date, at: s.startedAt, sets: ex.sets, best, equip: ex.equip });
  }
  return out.sort((a, b) => a.at - b.at);
}

// Progressive overload engine: decides today's prescription from last time.
export function prescribe(ex, history) {
  const { sets, min, max } = parseSets(ex.sets);
  const inc = parseIncrement(ex.progression);
  const last = history[history.length - 1];
  const fill = (fn) => Array.from({ length: sets }, (_, i) => ({ ...fn(i), done: false }));

  if (!last) {
    const w = parseStart(ex.startKg, ex.equip);
    return {
      rows: fill(() => ({ w, r: min })),
      hint: { kind: "start", text: `First log — start at ${ex.startKg}, aim for ${min}-${max} clean reps.` },
    };
  }

  const top = Math.max(...last.sets.map((s) => s.w));
  const toppedOut = last.sets.length >= sets && last.sets.every((s) => s.r >= max);

  if (toppedOut && inc != null) {
    const w = round(top + inc);
    return {
      rows: fill(() => ({ w, r: min })),
      hint: {
        kind: "up",
        text: `You hit ${sets}×${max} at ${fmtLoad(ex.equip, top)} last time. Load +${inc}kg → ${fmtLoad(ex.equip, w)}.`,
      },
    };
  }
  if (toppedOut) {
    return {
      rows: fill(() => ({ w: top, r: max })),
      hint: { kind: "up", text: `Top of the range hit. Level up the variation: ${ex.progression}` },
    };
  }
  const prev = (i) => last.sets[i] ?? last.sets[last.sets.length - 1];
  return {
    rows: fill((i) => ({ w: prev(i).w, r: prev(i).r })),
    hint: {
      kind: "beat",
      text: `Last time: ${fmtLoad(ex.equip, top)} × ${last.sets.map((s) => s.r).join(" · ")}. Beat one rep.`,
    },
  };
}

export function newWorkout(type, sessions) {
  const day = DAYS[type];
  return {
    type,
    startedAt: Date.now(),
    idx: 0,
    rest: null,
    exercises: day.exercises.map((ex) => {
      const { rows, hint } = prescribe(ex, exerciseHistory(sessions, ex.name));
      return { name: ex.name, equip: ex.equip, hint, sets: rows };
    }),
  };
}

export function sessionStats(session) {
  let volume = 0;
  let sets = 0;
  const bodyKg = session.bodyKg ?? PROFILE.startKg;
  for (const ex of session.exercises) {
    for (const s of ex.sets) {
      volume += effLoad(ex.equip, s.w, bodyKg) * s.r;
      sets += 1;
    }
  }
  return { volume, sets, ms: (session.endedAt ?? Date.now()) - session.startedAt };
}

// Which exercises in `session` beat their previous best e1RM.
export function findPRs(session, previous) {
  const prs = [];
  const bodyKg = session.bodyKg ?? PROFILE.startKg;
  for (const ex of session.exercises) {
    const before = exerciseHistory(previous, ex.name, bodyKg);
    if (!before.length) continue;
    const prevBest = Math.max(...before.map((h) => h.best.est));
    const now = exerciseHistory([session], ex.name, bodyKg)[0];
    if (now && now.best.est > prevBest + 0.01) prs.push({ name: ex.name, equip: ex.equip, set: now.best, gain: now.best.est - prevBest });
  }
  return prs;
}

export function weekCounts(sessions) {
  const counts = new Map();
  for (const s of sessions) {
    const k = dayKey(mondayOf(fromKey(s.date)));
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return counts;
}

// Consecutive weeks with ≥ `min` gym sessions. The current week only counts once it qualifies.
export function weekStreak(sessions, today, min = 3) {
  const counts = weekCounts(sessions);
  const c = (d) => counts.get(dayKey(d)) || 0;
  let wk = mondayOf(today);
  if (c(wk) < min) wk = addDays(wk, -7);
  let n = 0;
  while (c(wk) >= min) {
    n++;
    wk = addDays(wk, -7);
  }
  return n;
}

// Linear trend over the last 60 days of weigh-ins → pace and ETA to goal.
export function projectWeight(weights, goal) {
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 3) return null;
  const lastDate = fromKey(sorted[sorted.length - 1].date);
  const recent = sorted.filter((w) => daysBetween(fromKey(w.date), lastDate) <= 60);
  if (recent.length < 3) return null;
  const x0 = fromKey(recent[0].date);
  const xs = recent.map((w) => daysBetween(x0, fromKey(w.date)));
  const ys = recent.map((w) => w.kg);
  if (xs[xs.length - 1] < 7) return null;
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b) / n;
  const my = ys.reduce((a, b) => a + b) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den ? num / den : 0;
  const fitNow = my + slope * (xs[n - 1] - mx);
  const eta = slope > 0.002 && fitNow < goal ? addDays(lastDate, Math.ceil((goal - fitNow) / slope)) : null;
  return { perWeek: slope * 7, eta, fitNow };
}

export const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export function platesFor(total, bar = 20) {
  let rem = round((total - bar) / 2);
  if (rem <= 0) return { perSide: [], leftover: 0 };
  const perSide = [];
  for (const p of PLATES) {
    while (rem >= p - 1e-9) {
      perSide.push(p);
      rem = round(rem - p);
    }
  }
  return { perSide, leftover: rem };
}
