import { useCallback } from "react";
import { useStored } from "./store";

// Per-day log: habit checks, food entries and water. Keyed "YYYY-MM-DD".
const EMPTY_DAY = { habits: {}, food: [], water: 0 };

export function useDay(key) {
  const [days, setDays] = useStored("days");
  const day = { ...EMPTY_DAY, ...days[key] };
  const update = useCallback(
    (fn) => setDays((all) => ({ ...all, [key]: fn({ ...EMPTY_DAY, ...all[key] }) })),
    [key, setDays]
  );
  return [day, update];
}

export const dayTotals = (day) =>
  day.food.reduce((a, f) => ({ kcal: a.kcal + f.kcal, protein: a.protein + f.protein }), { kcal: 0, protein: 0 });
