// Turns the human-written plan strings ("4×6-10", "2-3 min", "BW +5kg", "45s each side")
// into numbers the workout and stretch modes can run on.

export function parseSets(str) {
  const m = str.match(/(\d+)\s*×\s*(\d+)(?:\s*-\s*(\d+))?/);
  if (!m) return { sets: 3, min: 8, max: 12 };
  return { sets: +m[1], min: +m[2], max: +(m[3] ?? m[2]) };
}

// Rest in seconds — midpoint of a range, rounded to 15s.
export function parseRest(str) {
  const m = str.match(/(\d+)(?:\s*-\s*(\d+))?\s*(min|sec)/i);
  if (!m) return 90;
  const mid = (+m[1] + +(m[2] ?? m[1])) / 2;
  const secs = /min/i.test(m[3]) ? mid * 60 : mid;
  return Math.round(secs / 15) * 15;
}

// Starting load in kg. For bodyweight moves it's the *added* load ("BW +5kg" → 5).
export function parseStart(str, equip) {
  if (equip === "bodyweight") {
    const m = str.match(/\+\s*(\d+(?:\.\d+)?)/);
    return m ? +m[1] : 0;
  }
  const m = str.match(/(\d+(?:\.\d+)?)/);
  return m ? +m[1] : 0;
}

// The jump the plan prescribes once the top of the rep range is hit.
// null = progress the variation instead of the load (e.g. knees → toes-to-bar).
export function parseIncrement(str) {
  const m = str.match(/add\s+(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*kg/i);
  if (m) return +m[1];
  if (/add weight/i.test(str)) return 2.5;
  return null;
}

// Weight stepper increment per equipment type.
export const weightStep = (equip) => (equip === "dumbbell" ? 1 : 2.5);

// Stretch holds: { rounds, secs, unit } or { reps: true } when it's a rep count.
export function parseHold(str) {
  const eachM = str.match(/each\s+(\w+)/i);
  const unit = eachM ? eachM[1].toLowerCase() : null;
  const rounds = unit ? 2 : 1;
  let m;
  if ((m = str.match(/(\d+)\s*×\s*(\d+)(?:\s*-\s*\d+)?\s*s\b/))) return { rounds: +m[1], secs: +m[2], unit: "set" };
  if ((m = str.match(/(\d+)(?:\s*-\s*\d+)?\s*min/i))) return { rounds, secs: +m[1] * 60, unit };
  if ((m = str.match(/(\d+)(?:\s*-\s*\d+)?\s*s\b/))) return { rounds, secs: +m[1], unit };
  return { reps: true, rounds: 1, secs: 0, unit: null };
}

// Meal descriptions → loggable macros.
export function parseMeal(desc) {
  const kcal = desc.match(/~?\s*(\d+)\s*kcal/i);
  const pro = desc.match(/(\d+)\s*g\s*protein/i);
  return { kcal: kcal ? +kcal[1] : 0, protein: pro ? +pro[1] : 0 };
}
