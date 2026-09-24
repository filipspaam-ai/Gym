import { useCallback, useSyncExternalStore } from "react";

// Tiny persisted store: every key is JSON in localStorage, shared across components
// via useSyncExternalStore, and synced across tabs via the `storage` event.
// If storage is unavailable (private mode, blocked), everything still works in memory.

const PREFIX = "ts2:";

const DEFAULTS = {
  sessions: [], // finished workouts
  active: null, // in-progress workout
  weights: [], // [{ date, kg }]
  days: {}, // { "YYYY-MM-DD": { habits: {}, food: [], water: 0 } }
  activities: [], // flex-day logs [{ date, type }]
  theme: "auto",
};

export const STORE_KEYS = Object.keys(DEFAULTS);

const cache = new Map();
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

function load(key) {
  if (cache.has(key)) return cache.get(key);
  let value = DEFAULTS[key];
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw != null) value = JSON.parse(raw);
  } catch {
    // unreadable storage — fall back to default
  }
  cache.set(key, value);
  return value;
}

function save(key, value) {
  cache.set(key, value);
  try {
    if (value === DEFAULTS[key]) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota / blocked — keep the in-memory value
  }
  emit();
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === null) cache.clear();
    else if (e.key.startsWith(PREFIX)) cache.delete(e.key.slice(PREFIX.length));
    else return;
    emit();
  });
}

export function useStored(key) {
  const value = useSyncExternalStore(subscribe, () => load(key));
  const set = useCallback(
    (next) => save(key, typeof next === "function" ? next(load(key)) : next),
    [key]
  );
  return [value, set];
}

export function exportAll() {
  const data = {};
  for (const k of STORE_KEYS) if (k !== "active") data[k] = load(k);
  return { app: "training-system", version: 2, exportedAt: new Date().toISOString(), data };
}

export function importAll(payload) {
  const data = payload?.data;
  if (!data || typeof data !== "object") throw new Error("Not a Training System backup file.");
  if ("sessions" in data && !Array.isArray(data.sessions)) throw new Error("Backup file is damaged (sessions).");
  for (const k of STORE_KEYS) if (k in data && k !== "active") save(k, data[k]);
}

export function resetAll() {
  for (const k of STORE_KEYS) if (k !== "theme") save(k, DEFAULTS[k]);
}
