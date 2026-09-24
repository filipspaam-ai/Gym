import { useEffect, useMemo, useRef, useState } from "react";
import { STRETCHING } from "../data/plan";
import { fmtClock } from "../lib/dates";
import { useNow, useWakeLock } from "../lib/hooks";
import { parseHold } from "../lib/parse";
import { chime } from "../lib/sound";
import { Ring, useScrollLock } from "../components/ui";
import * as I from "../components/Icons";

const READY_MS = 5000;
const SWITCH_MS = 3000;

const phaseAt = (i, round, phase, ms) => ({ i, round, phase, endAt: Date.now() + ms, left: ms, total: ms, paused: false });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function StretchMode({ type, onClose, onComplete }) {
  useWakeLock(true);
  useScrollLock(true);
  const routine = STRETCHING[type];
  const items = useMemo(() => routine.exercises.map((s) => ({ ...s, hold: parseHold(s.dur) })), [routine]);
  const [st, setSt] = useState(() => phaseAt(0, 0, "ready", READY_MS));
  const timed = st.phase === "ready" || st.phase === "hold";
  const running = timed && !st.paused;
  const now = useNow(200, running);
  const item = items[Math.min(st.i, items.length - 1)];

  const goTo = (i) => setSt(i >= items.length ? { ...st, phase: "complete" } : phaseAt(Math.max(0, i), 0, "ready", READY_MS));

  // Phase machine: ready → hold (× rounds, with a short switch between) → next stretch.
  useEffect(() => {
    if (!running || now < st.endAt) return;
    if (st.phase === "ready") {
      chime("tick");
      setSt(item.hold.reps ? { ...st, phase: "reps" } : phaseAt(st.i, st.round, "hold", item.hold.secs * 1000));
    } else if (st.round + 1 < item.hold.rounds) {
      chime("done");
      setSt(phaseAt(st.i, st.round + 1, "ready", SWITCH_MS));
    } else {
      chime("done");
      setSt(st.i + 1 >= items.length ? { ...st, phase: "complete" } : phaseAt(st.i + 1, 0, "ready", READY_MS));
    }
  }, [now, running, st, item, items.length]);

  const reported = useRef(false);
  useEffect(() => {
    if (st.phase !== "complete" || reported.current) return;
    reported.current = true;
    onComplete(items);
  }, [st.phase, items, onComplete]);

  const togglePause = () =>
    setSt((s) => (s.paused ? { ...s, paused: false, endAt: Date.now() + s.left } : { ...s, paused: true, left: Math.max(0, s.endAt - Date.now()) }));

  const remaining = running ? Math.max(0, st.endAt - now) : st.left;
  const roundLabel = item.hold.rounds > 1 ? `${cap(item.hold.unit ?? "round")} ${st.round + 1} of ${item.hold.rounds}` : null;
  const totalSecs = items.reduce((t, s) => t + (s.hold.reps ? 30 : s.hold.rounds * s.hold.secs), 0);

  return (
    <div className={`overlay stretch t-${type === "legs" ? "legs" : "pull"}`} role="dialog" aria-modal="true" aria-label={routine.name}>
      <div className="overlay-glow" aria-hidden="true" />
      <header className="wm-head">
        <button type="button" className="icon-btn" aria-label="Close stretching" onClick={onClose}>
          <I.X size={22} />
        </button>
        <div className="wm-title">
          <b>{routine.name}</b>
          <span className="mono">
            {st.phase === "complete" ? "Complete" : `${st.i + 1}/${items.length}`} · ~{Math.round(totalSecs / 60)} min
          </span>
        </div>
        <span style={{ width: 40 }} />
      </header>

      <nav className="wm-progress" aria-label="Stretches">
        {items.map((s, k) => (
          <button
            key={s.name}
            type="button"
            className={`wm-seg ${k === st.i && st.phase !== "complete" ? "cur" : ""}`}
            style={{ "--p": st.phase === "complete" || k < st.i ? 1 : 0 }}
            aria-label={`${k + 1}. ${s.name}`}
            onClick={() => goTo(k)}
          >
            <i />
          </button>
        ))}
      </nav>

      {st.phase === "complete" ? (
        <main className="st-body st-complete">
          <div className="summary-badge">
            <I.Check size={34} strokeWidth={3} />
          </div>
          <h1 className="summary-title">Stretch complete.</h1>
          <p className="body-text center">Logged to today's protocol. Stronger <em>and</em> more mobile — that's the whole point.</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={onClose}>
            Done
          </button>
        </main>
      ) : (
        <main className="st-body" key={`${st.i}-${st.round}-${st.phase}`}>
          <div className="st-ring">
            <Ring value={st.phase === "reps" ? 1 : remaining} max={st.phase === "reps" ? 1 : st.total} size={236} stroke={12} color="var(--accent)">
              <div className="st-ring-in">
                {st.phase === "reps" ? (
                  <>
                    <b className="st-big mono">{item.dur.match(/\d+/)?.[0]}</b>
                    <span>{item.dur.replace(/^\d+\s*/, "")}</span>
                  </>
                ) : (
                  <>
                    <span className="eyebrow">{st.phase === "ready" ? (st.round > 0 ? "Switch" : "Get ready") : "Hold"}</span>
                    <b className="st-big mono">{st.phase === "ready" ? Math.ceil(remaining / 1000) : fmtClock(Math.ceil(remaining / 1000))}</b>
                    {roundLabel && <span>{roundLabel}</span>}
                  </>
                )}
              </div>
            </Ring>
          </div>
          <div className="st-info">
            <span className={`tag tag-${item.tag}`}>{item.tag}</span>
            <h1 className="wm-name">{item.name}</h1>
            <p className="st-dur mono">{item.dur}</p>
            <p className="body-text">{item.detail}</p>
          </div>
        </main>
      )}

      {st.phase !== "complete" && (
        <footer className="st-controls">
          <button type="button" className="icon-btn lg" aria-label="Previous stretch" onClick={() => goTo(st.i - 1)} disabled={st.i === 0}>
            <I.ChevronLeft size={24} />
          </button>
          {st.phase === "reps" ? (
            <button type="button" className="play-btn" aria-label="Done, next stretch" onClick={() => goTo(st.i + 1)}>
              <I.Check size={30} strokeWidth={3} />
            </button>
          ) : (
            <button type="button" className="play-btn" aria-label={st.paused ? "Resume" : "Pause"} onClick={togglePause}>
              {st.paused ? <I.Play size={28} /> : <I.Pause size={28} />}
            </button>
          )}
          <button type="button" className="icon-btn lg" aria-label="Next stretch" onClick={() => goTo(st.i + 1)}>
            <I.Skip size={22} />
          </button>
        </footer>
      )}
    </div>
  );
}
