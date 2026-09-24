import { useState } from "react";
import { DAYS, EQUIP, FLEX_PHILOSOPHY, STRETCHING, TYPE_META, WEEK } from "../data/plan";
import { fmtDate, fromKey, weekdayIdx } from "../lib/dates";
import { parseSets } from "../lib/parse";
import { useStored } from "../lib/store";
import { exerciseHistory, fmtLoad, prescribe } from "../lib/training";
import { Disclosure, Segmented, SectionTitle } from "../components/ui";
import LineChart from "../components/LineChart";
import * as I from "../components/Icons";

const GYM_TYPES = ["push", "pull", "legs"];

// Today's workout if it's a gym day, otherwise the next one coming up.
function defaultType(todayKey) {
  const start = weekdayIdx(fromKey(todayKey));
  for (let i = 0; i < 7; i++) {
    const t = WEEK[(start + i) % 7].type;
    if (GYM_TYPES.includes(t)) return t;
  }
  return "push";
}

export default function Train({ todayKey, active, onStart, onResume, onStretch }) {
  const [type, setType] = useState(() => active?.type ?? defaultType(todayKey));
  const [sessions] = useStored("sessions");
  const day = DAYS[type];
  const stretch = STRETCHING[type];
  const totalSets = day.exercises.reduce((n, ex) => n + parseSets(ex.sets).sets, 0);
  const isActive = active?.type === type;

  return (
    <div className={`stack t-${type}`}>
      <header className="page-head">
        <h1>Train</h1>
        <p>Tap any exercise for cues, swaps and your history.</p>
      </header>

      <Segmented
        label="Workout"
        value={type}
        onChange={setType}
        options={GYM_TYPES.map((t) => ({ value: t, label: TYPE_META[t].name, className: `t-${t}` }))}
      />

      <section className="hero hero-compact">
        <div className="hero-glow" aria-hidden="true" />
        <h2 className="hero-title sm">{day.name}</h2>
        <p className="hero-sub">{day.focus}</p>
        <div className="hero-meta">
          <span>
            <I.Dumbbell size={15} /> {day.exercises.length} exercises
          </span>
          <span>
            <I.Target size={15} /> {totalSets} sets
          </span>
          <span>
            <I.Timer size={15} /> {day.duration}
          </span>
        </div>
        <div className="hero-actions">
          {isActive ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={onResume}>
              <I.Play size={16} /> Resume workout
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => onStart(type)}>
              <I.Play size={16} /> Start {day.name}
            </button>
          )}
        </div>
        {active && !isActive && <p className="hero-note">A {TYPE_META[active.type].name.toLowerCase()} workout is in progress — starting this one will ask to replace it.</p>}
      </section>

      <Disclosure
        className="card"
        head={
          <>
            <b>Warm-up</b>
            <small>5 min · {day.warmup.length} movements</small>
          </>
        }
      >
        <ul className="warmup">
          {day.warmup.map((w) => (
            <li key={w.name}>
              <span>{w.name}</span>
              <small>{w.detail}</small>
            </li>
          ))}
        </ul>
      </Disclosure>

      <SectionTitle>Exercises</SectionTitle>
      <div className="ex-list">
        {day.exercises.map((ex, i) => (
          <ExerciseItem key={ex.name} ex={ex} i={i} sessions={sessions} />
        ))}
      </div>

      <SectionTitle
        action={
          <button type="button" className="btn btn-sm btn-soft" onClick={() => onStretch(type)}>
            <I.Play size={13} /> Guided
          </button>
        }
      >
        {stretch.name} · {stretch.time}
      </SectionTitle>
      <section className="card stretch-list">
        {stretch.exercises.map((s) => (
          <Disclosure
            key={s.name}
            head={
              <>
                <b>{s.name}</b>
                <small>
                  <span className={`tag tag-${s.tag}`}>{s.tag}</span> {s.dur}
                </small>
              </>
            }
          >
            <p className="body-text">{s.detail}</p>
          </Disclosure>
        ))}
      </section>

      <section className="card callout">
        <div className="callout-icon">
          <I.Sparkle size={18} />
        </div>
        <div>
          <h3>Flexibility philosophy</h3>
          <p className="body-text">{FLEX_PHILOSOPHY}</p>
        </div>
      </section>
    </div>
  );
}

function ExerciseItem({ ex, i, sessions }) {
  const history = exerciseHistory(sessions, ex.name);
  const { rows, hint } = prescribe(ex, history);
  const next = rows[0];
  const recent = history.slice(-4).reverse();

  return (
    <Disclosure
      className="card ex-item"
      head={
        <>
          <span className="ex-num">{i + 1}</span>
          <span className="ex-main">
            <b>{ex.name}</b>
            <small>
              {EQUIP[ex.equip]} · {ex.sets} · {ex.rest}
            </small>
          </span>
          <span className={`ex-next ${hint.kind === "up" ? "up" : ""}`}>
            {hint.kind === "up" && <I.TrendUp size={12} strokeWidth={2.5} />}
            {fmtLoad(ex.equip, next.w)}
          </span>
        </>
      }
    >
      <div className="ex-body">
        <div className={`hint hint-${hint.kind}`}>
          {hint.kind === "up" ? <I.TrendUp size={16} /> : <I.Target size={16} />}
          <span>{hint.text}</span>
        </div>
        <dl className="cues">
          <div>
            <dt>Progression</dt>
            <dd>{ex.progression}</dd>
          </div>
          <div>
            <dt>Form</dt>
            <dd>{ex.note}</dd>
          </div>
          <div>
            <dt>Swap</dt>
            <dd>{ex.swap}</dd>
          </div>
          <div>
            <dt>Mobility</dt>
            <dd>{ex.flexTip}</dd>
          </div>
          <div>
            <dt>Start</dt>
            <dd>{ex.startKg}</dd>
          </div>
        </dl>
        {history.length > 1 && (
          <LineChart
            height={130}
            unit="kg"
            format={(v) => v.toFixed(0)}
            points={history.map((h) => ({ t: h.at, v: h.best.est, label: fmtDate(fromKey(h.date)) }))}
          />
        )}
        {recent.length > 0 && (
          <ul className="recent">
            {recent.map((h) => (
              <li key={h.at}>
                <span>{fmtDate(fromKey(h.date))}</span>
                <span className="mono">
                  {fmtLoad(ex.equip, Math.max(...h.sets.map((s) => s.w)))} × {h.sets.map((s) => s.r).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Disclosure>
  );
}
