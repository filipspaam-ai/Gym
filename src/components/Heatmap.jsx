import { useMemo, useState } from "react";
import { addDays, dayKey, fmtDate, mondayOf } from "../lib/dates";

const ROWS = ["M", "", "W", "", "F", "", "S"];

// GitHub-style training calendar. `entries` maps "YYYY-MM-DD" → [{ type, label }].
export default function Heatmap({ entries, todayKey, weeks = 18 }) {
  const [sel, setSel] = useState(null);
  const today = useMemo(() => {
    const [y, m, d] = todayKey.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [todayKey]);
  const start = addDays(mondayOf(today), -(weeks - 1) * 7);

  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const monday = addDays(start, w * 7);
    const prev = w ? addDays(start, (w - 1) * 7) : null;
    const month = !prev || prev.getMonth() !== monday.getMonth() ? fmtDate(monday, { month: "short" }) : "";
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(monday, d);
      const key = dayKey(date);
      days.push({ key, date, items: entries[key] ?? [], future: key > todayKey, today: key === todayKey });
    }
    cols.push({ month, days });
  }
  // Drop a month label that would collide with the next one (needs ~3 columns of room).
  for (let w = 0; w < cols.length; w++) {
    if (!cols[w].month) continue;
    const next = cols.findIndex((c, j) => j > w && c.month);
    if (next !== -1 && next - w < 3) cols[w].month = "";
  }

  const selDay = sel && cols.flatMap((c) => c.days).find((d) => d.key === sel);

  return (
    <div className="heat">
      <div className="heat-grid" style={{ "--weeks": weeks }}>
        <div className="heat-corner" />
        {cols.map((c, i) => (
          <div key={i} className="heat-month">
            {c.month}
          </div>
        ))}
        {ROWS.map((r, row) => (
          <HeatRow key={row} label={r} row={row} cols={cols} sel={sel} onSel={setSel} />
        ))}
      </div>
      <div className="heat-foot">
        {selDay ? (
          <span>
            <strong>{fmtDate(selDay.date, { weekday: "short", month: "short", day: "numeric" })}</strong>
            {" — "}
            {selDay.items.length ? selDay.items.map((i) => i.label).join(" + ") : selDay.future ? "Upcoming" : "Nothing logged"}
          </span>
        ) : (
          <span className="muted">Tap a day for details</span>
        )}
        <div className="heat-legend">
          {["push", "pull", "legs", "flex"].map((t) => (
            <span key={t} className="heat-key">
              <i className={`heat-cell t-${t} on`} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatRow({ label, row, cols, sel, onSel }) {
  return (
    <>
      <div className="heat-label">{label}</div>
      {cols.map((c, i) => {
        const d = c.days[row];
        const type = d.items[0]?.type;
        return (
          <button
            key={i}
            type="button"
            className={`heat-cell ${type ? `t-${type} on` : ""} ${d.items.length > 1 ? "multi" : ""} ${d.future ? "future" : ""} ${d.today ? "today" : ""} ${sel === d.key ? "sel" : ""}`}
            aria-label={`${d.key}: ${d.items.map((x) => x.label).join(", ") || "nothing logged"}`}
            onClick={() => onSel(sel === d.key ? null : d.key)}
            disabled={d.future}
          />
        );
      })}
    </>
  );
}
