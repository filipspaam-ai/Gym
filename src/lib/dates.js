// Local-time date helpers. Days are keyed "YYYY-MM-DD" in the user's timezone.

const pad = (n) => String(n).padStart(2, "0");

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// 0 = Monday … 6 = Sunday
export const weekdayIdx = (d) => (d.getDay() + 6) % 7;

export const mondayOf = (d) => addDays(startOfDay(d), -weekdayIdx(d));

export const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);

export const fmtDate = (d, opts = { month: "short", day: "numeric" }) => d.toLocaleDateString(undefined, opts);

export const fmtClock = (secs) => {
  const s = Math.max(0, Math.round(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${m}:${pad(r)}`;
};

export const fmtDuration = (ms) => {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "<1 min";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${pad(mins % 60)}m`;
};
