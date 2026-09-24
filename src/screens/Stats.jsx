import { useMemo, useState } from "react";
import { ACTIVITIES, DAYS, PROFILE } from "../data/plan";
import { addDays, dayKey, fmtDate, fmtDuration, fromKey } from "../lib/dates";
import { useStored } from "../lib/store";
import { exerciseHistory, fmtLoad, projectWeight, sessionStats, weekStreak } from "../lib/training";
import { Empty, Stepper, toast } from "../components/ui";
import Heatmap from "../components/Heatmap";
import LineChart from "../components/LineChart";
import * as I from "../components/Icons";

const ACT = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

// Main lifts first; any other logged exercise is appended.
const FEATURED = ["Flat Bench Press", "Back Squat", "Romanian Deadlift", "Standing Overhead Press", "Barbell Row", "Weighted Pull-Ups", "Weighted Dips"];

export default function Stats({ todayKey }) {
  const [sessions] = useStored("sessions");
  const [activities] = useStored("activities");
  const today = fromKey(todayKey);

  const entries = useMemo(() => {
    const map = {};
    const push = (k, v) => (map[k] ??= []).push(v);
    for (const s of [...sessions].sort((a, b) => a.startedAt - b.startedAt)) push(s.date, { type: s.type, label: DAYS[s.type]?.name ?? s.type });
    for (const a of activities) if (a.type !== "rest") push(a.date, { type: "flex", label: ACT[a.type]?.label ?? a.type });
    return map;
  }, [sessions, activities]);

  const monthStart = dayKey(new Date(today.getFullYear(), today.getMonth(), 1));
  const since30 = dayKey(addDays(today, -29));
  const volume30 = sessions.filter((s) => s.date >= since30).reduce((v, s) => v + sessionStats(s).volume, 0);

  return (
    <div className="stack t-push">
      <header className="page-head">
        <h1>Progress</h1>
        <p>Everything is saved on this device. Back it up from Guide → App.</p>
      </header>

      <div className="stat-grid">
        <Stat label="Sessions" value={sessions.length} sub="all time" />
        <Stat label="This month" value={sessions.filter((s) => s.date >= monthStart).length} sub={fmtDate(today, { month: "long" })} />
        <Stat label="Streak" value={weekStreak(sessions, today)} sub="weeks with 3+" icon={<I.Flame size={16} />} />
        <Stat label="Volume" value={(volume30 / 1000).toFixed(1)} unit="t" sub="last 30 days" />
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Training calendar</h2>
          <span className="muted small">18 weeks</span>
        </div>
        <Heatmap entries={entries} todayKey={todayKey} />
      </section>

      <BodyWeight todayKey={todayKey} />
      <Strength sessions={sessions} />
      <History sessions={sessions} />
    </div>
  );
}

function Stat({ label, value, unit, sub, icon }) {
  return (
    <div className="stat">
      <span className="stat-label">
        {icon}
        {label}
      </span>
      <span className="stat-value">
        {value}
        {unit && <em>{unit}</em>}
      </span>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}

function BodyWeight({ todayKey }) {
  const [weights, setWeights] = useStored("weights");
  const sorted = useMemo(() => [...weights].sort((a, b) => a.date.localeCompare(b.date)), [weights]);
  const latest = sorted.length ? sorted[sorted.length - 1].kg : PROFILE.startKg;
  const [draft, setDraft] = useState(latest);
  const loggedToday = weights.find((w) => w.date === todayKey);
  const proj = projectWeight(weights, PROFILE.goalKg);
  const pct = Math.max(0, Math.min(1, (latest - PROFILE.startKg) / (PROFILE.goalKg - PROFILE.startKg)));

  const save = () => {
    setWeights((ws) => [...ws.filter((w) => w.date !== todayKey), { date: todayKey, kg: +draft.toFixed(1) }]);
    toast(`Weight logged: ${draft}kg`);
  };

  let pace = null;
  if (proj) {
    const wk = proj.perWeek;
    if (wk > 0.5) pace = { tone: "warn", text: `Gaining ${wk.toFixed(2)}kg/week — faster than a lean bulk (0.25-0.5kg/wk). Trim portions slightly to keep it lean.` };
    else if (wk >= 0.15) pace = { tone: "good", text: `Gaining ${wk.toFixed(2)}kg/week — right in the lean-bulk sweet spot.` };
    else pace = { tone: "warn", text: `Only ${wk.toFixed(2)}kg/week. Scale not moving → add a snack or bigger portions.` };
  }

  return (
    <section className="card t-pull">
      <div className="card-head">
        <h2>Body weight</h2>
        <span className="muted small">
          {PROFILE.startKg} → {PROFILE.goalKg}kg lean
        </span>
      </div>
      <div className="bw-top">
        <div className="bw-now">
          <span className="bw-kg">
            {latest.toFixed(1)}
            <em>kg</em>
          </span>
          <span className="muted small">{sorted.length ? `Last weigh-in ${fmtDate(fromKey(sorted[sorted.length - 1].date))}` : "Starting weight"}</span>
        </div>
        <div className="bw-log">
          <Stepper value={draft} onChange={setDraft} step={0.1} quantum={0.1} label="Body weight in kg" />
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>
            {loggedToday ? "Update" : "Log today"}
          </button>
        </div>
      </div>
      <div className="goal-bar" aria-label={`${Math.round(pct * 100)}% of the way to ${PROFILE.goalKg}kg`}>
        <i style={{ width: `${Math.max(2, pct * 100)}%` }} />
        <span>{Math.round(pct * 100)}%</span>
      </div>
      {sorted.length >= 2 ? (
        <LineChart
          points={sorted.map((w) => ({ t: fromKey(w.date).getTime(), v: w.kg, label: fmtDate(fromKey(w.date)) }))}
          goal={PROFILE.goalKg}
          unit="kg"
        />
      ) : (
        <Empty icon={I.Scale} title="Log 2+ weigh-ins to see your trend">
          Weigh in the same way each time — morning, after the bathroom, before food.
        </Empty>
      )}
      {proj && (
        <div className={`insight insight-${pace.tone}`}>
          <I.TrendUp size={16} />
          <div>
            <p>{pace.text}</p>
            {proj.eta && (
              <p>
                At this pace you hit <b>{PROFILE.goalKg}kg</b> around <b>{fmtDate(proj.eta, { month: "long", day: "numeric", year: "numeric" })}</b>.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Strength({ sessions }) {
  const logged = useMemo(() => {
    const names = new Set(sessions.flatMap((s) => s.exercises.map((e) => e.name)));
    return [...FEATURED.filter((n) => names.has(n)), ...[...names].filter((n) => !FEATURED.includes(n))];
  }, [sessions]);
  const [pick, setPick] = useState(null);
  const sel = pick && logged.includes(pick) ? pick : logged[0];
  const hist = sel ? exerciseHistory(sessions, sel) : [];
  const best = hist.reduce((b, h) => (!b || h.best.est > b.best.est ? h : b), null);
  const gain = hist.length > 1 ? hist[hist.length - 1].best.est - hist[0].best.est : 0;
  const equip = hist[0]?.equip;

  return (
    <section className="card t-legs">
      <div className="card-head">
        <h2>Strength</h2>
        <span className="muted small">est. 1RM{equip === "bodyweight" ? " incl. bodyweight" : ""}</span>
      </div>
      {!logged.length ? (
        <Empty icon={I.TrendUp} title="Your lifts will chart here">
          Finish a workout and every exercise gets an estimated-1RM trend line.
        </Empty>
      ) : (
        <>
          <div className="chips scroll">
            {logged.map((n) => (
              <button key={n} type="button" className={`chip ${n === sel ? "on" : ""}`} aria-pressed={n === sel} onClick={() => setPick(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="lift-stats">
            <div>
              <span className="muted small">Best e1RM</span>
              <b>{best.best.est.toFixed(1)}kg</b>
            </div>
            <div>
              <span className="muted small">Best set</span>
              <b>
                {fmtLoad(equip, best.best.w)} × {best.best.r}
              </b>
            </div>
            <div>
              <span className="muted small">Change</span>
              <b className={gain > 0 ? "pos" : ""}>
                {gain >= 0 ? "+" : ""}
                {gain.toFixed(1)}kg
              </b>
            </div>
          </div>
          {hist.length >= 2 ? (
            <LineChart points={hist.map((h) => ({ t: h.at, v: h.best.est, label: fmtDate(fromKey(h.date)) }))} unit="kg" />
          ) : (
            <p className="muted small">Log this lift one more time to draw the trend.</p>
          )}
        </>
      )}
    </section>
  );
}

function History({ sessions }) {
  const [, setSessions] = useStored("sessions");
  const [all, setAll] = useState(false);
  const list = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
  const shown = all ? list : list.slice(0, 6);

  const remove = (s) => {
    if (!window.confirm(`Delete ${DAYS[s.type]?.name ?? "session"} from ${fmtDate(fromKey(s.date))}? This can't be undone.`)) return;
    setSessions((ss) => ss.filter((x) => x.id !== s.id));
    toast("Session deleted");
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>History</h2>
        <span className="muted small">{sessions.length} sessions</span>
      </div>
      {!list.length ? (
        <Empty icon={I.Dumbbell} title="No workouts logged yet">
          Hit “Start workout” on Today — sets, rest and PRs get tracked automatically.
        </Empty>
      ) : (
        <ul className="history">
          {shown.map((s) => {
            const st = sessionStats(s);
            return (
              <li key={s.id} className={`t-${s.type}`}>
                <span className="history-bar" />
                <div className="history-main">
                  <b>{DAYS[s.type]?.name ?? s.type}</b>
                  <small>
                    {fmtDate(fromKey(s.date), { weekday: "short", month: "short", day: "numeric" })} · {fmtDuration(st.ms)} · {st.sets} sets · {(st.volume / 1000).toFixed(2)}t
                  </small>
                </div>
                <button type="button" className="icon-btn sm ghost" aria-label="Delete session" onClick={() => remove(s)}>
                  <I.Trash size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > 6 && (
        <button type="button" className="btn btn-ghost btn-block" onClick={() => setAll((a) => !a)}>
          {all ? "Show less" : `Show all ${list.length}`}
        </button>
      )}
    </section>
  );
}
