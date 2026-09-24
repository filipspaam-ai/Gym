import { useEffect, useRef } from "react";
import { DAYS, EQUIP, STRETCHING } from "../data/plan";
import { fmtClock, fmtDate, fmtDuration, fromKey } from "../lib/dates";
import { useNow, useWakeLock } from "../lib/hooks";
import { parseRest, weightStep } from "../lib/parse";
import { chime } from "../lib/sound";
import { fmtLoad, platesFor, sessionStats } from "../lib/training";
import { Disclosure, Ring, Stepper, useScrollLock } from "../components/ui";
import Barbell from "../components/Barbell";
import Confetti from "../components/Confetti";
import * as I from "../components/Icons";

export default function WorkoutMode({ active, setActive, onMinimize, onFinish, onDiscard }) {
  useWakeLock(true);
  useScrollLock(true);
  const now = useNow(1000);

  const day = DAYS[active.type];
  const n = active.exercises.length;
  const i = Math.min(active.idx, n - 1);
  const ex = day.exercises[i];
  const log = active.exercises[i];
  const restSecs = parseRest(ex.rest);
  const nextSet = log.sets.findIndex((s) => !s.done);
  const allSets = active.exercises.flatMap((e) => e.sets);
  const doneCount = allSets.filter((s) => s.done).length;

  const update = (fn) => setActive((a) => (a ? fn(a) : a));
  const patchSets = (fn) => update((a) => ({ ...a, exercises: a.exercises.map((e, k) => (k === i ? { ...e, sets: fn(e.sets) } : e)) }));
  const go = (idx) => update((a) => ({ ...a, idx }));

  // Changing a weight carries forward to the sets you haven't done yet.
  const setWeight = (si, w) => patchSets((sets) => sets.map((s, j) => (j === si || (j > si && !s.done) ? { ...s, w } : s)));
  const setReps = (si, r) => patchSets((sets) => sets.map((s, j) => (j === si ? { ...s, r } : s)));
  const addSet = () => patchSets((sets) => [...sets, { ...sets[sets.length - 1], done: false }]);
  const removeSet = () => patchSets((sets) => (sets.length > 1 && !sets[sets.length - 1].done ? sets.slice(0, -1) : sets));

  const toggle = (si) => {
    const wasDone = log.sets[si].done;
    const completes = !wasDone && log.sets.every((s, j) => j === si || s.done);
    const lastEx = i === n - 1;
    update((a) => ({
      ...a,
      exercises: a.exercises.map((e, k) => (k === i ? { ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, done: !wasDone } : s)) } : e)),
      rest: !wasDone && !(completes && lastEx) ? { endAt: Date.now() + restSecs * 1000, dur: restSecs } : a.rest,
    }));
    if (!wasDone) chime("tick");
    if (completes && !lastEx) setTimeout(() => update((a) => (a.idx === i ? { ...a, idx: i + 1 } : a)), 650);
  };

  const finish = () => {
    if (doneCount === 0) {
      if (window.confirm("No sets logged yet. Discard this workout?")) onDiscard();
      return;
    }
    const left = allSets.length - doneCount;
    if (left > 0 && !window.confirm(`${left} planned set${left > 1 ? "s" : ""} not ticked. Finish and save anyway?`)) return;
    onFinish();
  };

  let nextLabel;
  if (nextSet === 0) nextLabel = `${ex.name} · ${fmtLoad(ex.equip, log.sets[0].w)} × ${log.sets[0].r}`;
  else if (nextSet > 0) nextLabel = `Set ${nextSet + 1} · ${fmtLoad(ex.equip, log.sets[nextSet].w)} × ${log.sets[nextSet].r}`;
  else if (i + 1 < n) nextLabel = `Up next: ${day.exercises[i + 1].name}`;
  else nextLabel = "Last one done — finish strong";

  const barW = log.sets[nextSet >= 0 ? nextSet : log.sets.length - 1].w;

  return (
    <div className={`overlay wm t-${active.type}`} role="dialog" aria-modal="true" aria-label={`${day.name} workout`}>
      <div className="overlay-glow" aria-hidden="true" />
      <header className="wm-head">
        <button type="button" className="icon-btn" aria-label="Minimize workout" onClick={onMinimize}>
          <I.ChevronDown size={22} />
        </button>
        <div className="wm-title">
          <b>{day.name}</b>
          <span className="mono">
            {fmtClock((now - active.startedAt) / 1000)} · {doneCount}/{allSets.length} sets
          </span>
        </div>
        <button type="button" className="btn btn-sm btn-primary" onClick={finish}>
          Finish
        </button>
      </header>

      <nav className="wm-progress" aria-label="Exercises">
        {active.exercises.map((e, k) => {
          const d = e.sets.filter((s) => s.done).length / e.sets.length;
          return (
            <button key={e.name} type="button" className={`wm-seg ${k === i ? "cur" : ""}`} style={{ "--p": d }} aria-label={`${k + 1}. ${e.name}`} aria-current={k === i} onClick={() => go(k)}>
              <i />
            </button>
          );
        })}
      </nav>

      <main className="wm-body" key={i}>
        <div className="eyebrow">
          Exercise {i + 1} of {n} · {EQUIP[ex.equip]}
        </div>
        <h1 className="wm-name">{ex.name}</h1>
        <div className="wm-meta">
          <span>
            <I.Target size={14} /> {ex.sets}
          </span>
          <span>
            <I.Timer size={14} /> {fmtClock(restSecs)} rest
          </span>
        </div>

        <div className={`hint hint-${log.hint.kind}`}>
          {log.hint.kind === "up" ? <I.TrendUp size={16} /> : <I.Target size={16} />}
          <span>{log.hint.text}</span>
        </div>

        <div className="sets">
          <div className="sets-head">
            <span>Set</span>
            <span>{ex.equip === "bodyweight" ? "Added kg" : "kg"}</span>
            <span>Reps</span>
            <span />
          </div>
          {log.sets.map((s, si) => (
            <div key={si} className={`set-row ${s.done ? "done" : ""} ${si === nextSet ? "next" : ""}`}>
              <span className="set-num">{si + 1}</span>
              <Stepper value={s.w} onChange={(w) => setWeight(si, w)} step={weightStep(ex.equip)} label={`Set ${si + 1} weight`} />
              <Stepper value={s.r} onChange={(r) => setReps(si, r)} step={1} integer label={`Set ${si + 1} reps`} />
              <button type="button" className="set-check" aria-pressed={s.done} aria-label={`${s.done ? "Undo" : "Complete"} set ${si + 1}`} onClick={() => toggle(si)}>
                <I.Check size={20} strokeWidth={3} />
              </button>
            </div>
          ))}
          <div className="sets-foot">
            <button type="button" className="link-btn" onClick={addSet}>
              <I.Plus size={14} /> Add set
            </button>
            {log.sets.length > 1 && !log.sets[log.sets.length - 1].done && (
              <button type="button" className="link-btn muted" onClick={removeSet}>
                <I.Minus size={14} /> Remove set
              </button>
            )}
          </div>
        </div>

        {ex.equip === "barbell" && <PlatesInline w={barW} />}

        <Disclosure className="card" head={<b>Coaching cues</b>}>
          <dl className="cues">
            <div>
              <dt>Form</dt>
              <dd>{ex.note}</dd>
            </div>
            <div>
              <dt>Progression</dt>
              <dd>{ex.progression}</dd>
            </div>
            <div>
              <dt>Swap</dt>
              <dd>{ex.swap}</dd>
            </div>
            <div>
              <dt>Mobility</dt>
              <dd>{ex.flexTip}</dd>
            </div>
          </dl>
        </Disclosure>
      </main>

      <footer className="wm-foot">
        <button type="button" className="btn btn-ghost" disabled={i === 0} onClick={() => go(i - 1)}>
          <I.ChevronLeft size={18} /> Prev
        </button>
        {i < n - 1 ? (
          <button type="button" className="btn btn-soft" onClick={() => go(i + 1)}>
            Next <I.ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={finish}>
            Finish <I.Check size={18} />
          </button>
        )}
      </footer>

      {active.rest && (
        <RestCard
          rest={active.rest}
          next={nextLabel}
          onAdjust={(d) => update((a) => (a.rest ? { ...a, rest: { endAt: a.rest.endAt + d * 1000, dur: Math.max(15, a.rest.dur + d) } } : a))}
          onSkip={() => update((a) => ({ ...a, rest: null }))}
        />
      )}
    </div>
  );
}

function PlatesInline({ w }) {
  const { perSide, leftover } = platesFor(w);
  return (
    <div className="plates-inline">
      <Barbell perSide={perSide} height={64} />
      <span>
        <b>{w}kg</b> → {perSide.length ? `${perSide.join(" + ")} each side` : "empty 20kg bar"}
        {leftover > 0 && ` (+${leftover * 2}kg short)`}
      </span>
    </div>
  );
}

function RestCard({ rest, next, onAdjust, onSkip }) {
  const now = useNow(250);
  const left = Math.max(0, (rest.endAt - now) / 1000);
  const over = left <= 0;
  const alerted = useRef(null);
  const skipRef = useRef(onSkip);
  useEffect(() => {
    skipRef.current = onSkip;
  });

  useEffect(() => {
    if (!over) return;
    if (alerted.current !== rest.endAt) {
      alerted.current = rest.endAt;
      if (Date.now() - rest.endAt < 5000) chime("done");
    }
    const id = setTimeout(() => skipRef.current(), 2500);
    return () => clearTimeout(id);
  }, [over, rest.endAt]);

  return (
    <div className={`rest ${over ? "over" : ""}`} role="timer" aria-live="off">
      <Ring value={left} max={rest.dur} size={78} stroke={6} color="var(--accent)">
        <span className="rest-time mono">{over ? "GO" : fmtClock(left)}</span>
      </Ring>
      <div className="rest-text">
        <span className="eyebrow">{over ? "Rest over" : "Resting"}</span>
        <b>{next}</b>
        <div className="rest-btns">
          <button type="button" className="chip" onClick={() => onAdjust(-15)} disabled={over}>
            −15s
          </button>
          <button type="button" className="chip" onClick={() => onAdjust(15)}>
            +15s
          </button>
          <button type="button" className="chip chip-strong" onClick={onSkip}>
            <I.Skip size={13} /> Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export function Summary({ session, prs, onClose, onStretch }) {
  useScrollLock(true);
  const st = sessionStats(session);
  const day = DAYS[session.type];
  const stretch = STRETCHING[session.type];
  const prNames = new Set(prs.map((p) => p.name));

  return (
    <div className={`overlay summary t-${session.type}`} role="dialog" aria-modal="true" aria-label="Workout summary">
      <div className="overlay-glow" aria-hidden="true" />
      <Confetti fire={session.id} />
      <div className="summary-inner">
        <div className="summary-badge">
          <I.Trophy size={34} />
        </div>
        <p className="eyebrow">{fmtDate(fromKey(session.date), { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="summary-title">{day.name} done.</h1>
        <div className="summary-stats">
          <div>
            <b>{fmtDuration(st.ms)}</b>
            <span>Time</span>
          </div>
          <div>
            <b>{st.sets}</b>
            <span>Sets</span>
          </div>
          <div>
            <b>
              {(st.volume / 1000).toFixed(2)}
              <em>t</em>
            </b>
            <span>Volume</span>
          </div>
        </div>

        {prs.length > 0 && (
          <div className="prs">
            <div className="prs-head">
              <I.Sparkle size={16} /> {prs.length} new personal record{prs.length > 1 ? "s" : ""}
            </div>
            {prs.map((p) => (
              <div key={p.name} className="pr">
                <span>{p.name}</span>
                <span className="mono">
                  {fmtLoad(p.equip, p.set.w)} × {p.set.r} <em>+{p.gain.toFixed(1)}kg e1RM</em>
                </span>
              </div>
            ))}
          </div>
        )}

        <ul className="summary-list">
          {session.exercises.map((e) => (
            <li key={e.name}>
              <span>
                {prNames.has(e.name) && <I.Sparkle size={12} className="pr-star" />}
                {e.name}
              </span>
              <span className="mono muted">
                {fmtLoad(e.equip, Math.max(...e.sets.map((s) => s.w)))} × {e.sets.map((s) => s.r).join("·")}
              </span>
            </li>
          ))}
        </ul>

        <div className="summary-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onStretch}>
            <I.Stretch size={16} /> {stretch.name} · {stretch.time}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
