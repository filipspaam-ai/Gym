import { ACTIVITIES, DAYS, HABITS, NUTRITION, PROFILE, STRETCHING, TYPE_META, WEEK } from "../data/plan";
import { addDays, dayKey, fmtDate, fmtDuration, fromKey, mondayOf, weekdayIdx } from "../lib/dates";
import { dayTotals, useDay } from "../lib/day";
import { useStored } from "../lib/store";
import { exerciseHistory, fmtLoad, latestBodyKg, prescribe, sessionStats, weekStreak } from "../lib/training";
import { Ring, toast } from "../components/ui";
import * as I from "../components/Icons";

const GYM_PER_WEEK = WEEK.filter((d) => d.type in DAYS).length;

export default function Today({ todayKey, active, onStart, onResume, onStretch, go }) {
  const date = fromKey(todayKey);
  const plan = WEEK[weekdayIdx(date)];
  const tomorrow = WEEK[(weekdayIdx(date) + 1) % 7];
  const [sessions] = useStored("sessions");
  const [activities] = useStored("activities");
  const [weights] = useStored("weights");

  const monday = mondayOf(date);
  const weekKeys = WEEK.map((_, i) => dayKey(addDays(monday, i)));
  const gymThisWeek = sessions.filter((s) => weekKeys.includes(s.date)).length;
  const streak = weekStreak(sessions, date);
  const bodyKg = latestBodyKg(weights);
  const bodyPct = (bodyKg - PROFILE.startKg) / (PROFILE.goalKg - PROFILE.startKg);

  return (
    <div className={`stack t-${plan.type}`}>
      <Hero
        plan={plan}
        date={date}
        todayKey={todayKey}
        sessions={sessions}
        active={active}
        onStart={onStart}
        onResume={onResume}
        onStretch={onStretch}
        go={go}
      />

      <div className="week-strip" aria-label="This week">
        {WEEK.map((w, i) => {
          const k = weekKeys[i];
          const did = sessions.some((s) => s.date === k) || activities.some((a) => a.date === k && a.type !== "rest");
          return (
            <div key={k} className={`wk t-${w.type} ${k === todayKey ? "today" : ""} ${did ? "did" : ""} ${k > todayKey ? "future" : ""}`} title={`${w.day}: ${w.label}`}>
              <span className="wk-day">{w.day.slice(0, 1)}</span>
              <span className="wk-num">{addDays(monday, i).getDate()}</span>
              <span className="wk-mark">{did ? <I.Check size={12} strokeWidth={3.5} /> : <i />}</span>
            </div>
          );
        })}
      </div>

      <div className="tiles">
        <button type="button" className="tile" onClick={() => go("stats")}>
          <Ring value={gymThisWeek} max={GYM_PER_WEEK} size={46} stroke={5} color="var(--c-push)">
            <span className="tile-ring-num">{gymThisWeek}</span>
          </Ring>
          <span className="tile-label">
            of {GYM_PER_WEEK}
            <small>sessions this week</small>
          </span>
        </button>
        <button type="button" className="tile" onClick={() => go("stats")}>
          <span className={`tile-icon ${streak ? "hot" : ""}`}>
            <I.Flame size={22} />
          </span>
          <span className="tile-label">
            {streak} wk
            <small>streak (3+ sessions)</small>
          </span>
        </button>
        <button type="button" className="tile tile-wide" onClick={() => go("stats")}>
          <span className="tile-label">
            {bodyKg.toFixed(1)}
            <em>kg</em>
            <small>
              {bodyKg >= PROFILE.goalKg ? "Goal reached 🎯" : `${(PROFILE.goalKg - bodyKg).toFixed(1)}kg to ${PROFILE.goalKg}kg`}
            </small>
          </span>
          <span className="bar" aria-hidden="true">
            <i style={{ width: `${Math.max(0.03, Math.min(1, bodyPct)) * 100}%` }} />
          </span>
        </button>
      </div>

      <DailyCard todayKey={todayKey} go={go} />

      <button type="button" className={`card next-up t-${tomorrow.type}`} onClick={() => go(tomorrow.type in DAYS ? "train" : "guide")}>
        <span className="next-dot" />
        <span className="next-text">
          <small>Tomorrow</small>
          <b>{tomorrow.label}</b>
          <span>{DAYS[tomorrow.type]?.focus ?? (tomorrow.type === "flex" ? "Adapt to your day" : "Recovery IS training")}</span>
        </span>
        <I.ChevronRight size={18} className="muted" />
      </button>
    </div>
  );
}

function Hero({ plan, date, todayKey, sessions, active, onStart, onResume, onStretch, go }) {
  const type = plan.type;
  const day = DAYS[type];
  const doneToday = sessions.filter((s) => s.date === todayKey);
  const eyebrow = fmtDate(date, { weekday: "long", month: "long", day: "numeric" });

  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-top">
        <span className="eyebrow">{eyebrow}</span>
        <span className="pill">{plan.badge}</span>
      </div>
      <h1 className="hero-title">{TYPE_META[type].name}</h1>
      <p className="hero-sub">{day ? day.focus : plan.label.replace(/^Flex — /, "")}</p>

      {day ? (
        <>
          <div className="hero-meta">
            <span>
              <I.Dumbbell size={15} /> {day.exercises.length} exercises
            </span>
            <span>
              <I.Timer size={15} /> {day.duration}
            </span>
            {/variation/i.test(plan.label) && <span className="pill pill-soft">Variation</span>}
          </div>
          <TodayTargets type={type} sessions={sessions} />
          <div className="hero-actions">
            {active ? (
              <button type="button" className="btn btn-primary btn-lg" onClick={onResume}>
                <I.Play size={16} /> Resume {TYPE_META[active.type].name.toLowerCase()} workout
              </button>
            ) : doneToday.length ? (
              <>
                <div className="done-banner">
                  <I.Check size={16} strokeWidth={3} />
                  Done — {fmtDuration(sessionStats(doneToday[0]).ms)} · {sessionStats(doneToday[0]).sets} sets
                </div>
                <button type="button" className="btn btn-primary" onClick={() => onStretch(type)}>
                  <I.Stretch size={16} /> {STRETCHING[type].name}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary btn-lg" onClick={() => onStart(type)}>
                <I.Play size={16} /> Start workout
              </button>
            )}
          </div>
        </>
      ) : (
        <FlexOrRest type={type} todayKey={todayKey} active={active} onResume={onResume} onStretch={onStretch} go={go} />
      )}
    </section>
  );
}

function TodayTargets({ type, sessions }) {
  const rows = DAYS[type].exercises.map((ex) => {
    const { rows, hint } = prescribe(ex, exerciseHistory(sessions, ex.name));
    return { ex, first: rows[0], up: hint.kind === "up" };
  });
  return (
    <ol className="targets">
      {rows.map(({ ex, first, up }) => (
        <li key={ex.name}>
          <span className="targets-name">{ex.name}</span>
          <span className={`targets-load ${up ? "up" : ""}`}>
            {up && <I.TrendUp size={13} strokeWidth={2.5} />}
            {fmtLoad(ex.equip, first.w)} × {first.r}
          </span>
        </li>
      ))}
    </ol>
  );
}

function FlexOrRest({ type, todayKey, active, onResume, onStretch, go }) {
  const [activities, setActivities] = useStored("activities");
  const logged = new Set(activities.filter((a) => a.date === todayKey).map((a) => a.type));
  const toggle = (id, label) => {
    const on = logged.has(id);
    setActivities((list) => (on ? list.filter((a) => !(a.date === todayKey && a.type === id)) : [...list, { date: todayKey, type: id }]));
    if (!on) toast(`Logged: ${label}`);
  };

  return (
    <>
      <p className="hero-ask">{type === "rest" ? "Sunday is non-negotiable rest. Mobility only." : "What did you do today?"}</p>
      <div className="chips">
        {ACTIVITIES.map((a) => (
          <button key={a.id} type="button" className={`chip ${logged.has(a.id) ? "on" : ""}`} aria-pressed={logged.has(a.id)} onClick={() => toggle(a.id, a.label)}>
            <span aria-hidden="true">{a.emoji}</span> {a.label}
          </button>
        ))}
      </div>
      <div className="hero-actions">
        {active ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={onResume}>
            <I.Play size={16} /> Resume {TYPE_META[active.type].name.toLowerCase()} workout
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => onStretch("legs")}>
            <I.Stretch size={16} /> Guided mobility · {STRETCHING.legs.time}
          </button>
        )}
        {type === "flex" && (
          <button type="button" className="btn btn-ghost" onClick={() => go("guide", "flex")}>
            Flex playbook <I.ChevronRight size={16} />
          </button>
        )}
      </div>
    </>
  );
}

function DailyCard({ todayKey, go }) {
  const [day, update] = useDay(todayKey);
  const done = HABITS.filter((h) => day.habits[h.id]).length;
  const { protein } = dayTotals(day);
  const { goals } = NUTRITION;

  const toggle = (id) => update((d) => ({ ...d, habits: { ...d.habits, [id]: !d.habits[id] } }));
  const water = (delta) => update((d) => ({ ...d, water: Math.max(0, Math.round((d.water + delta) * 100) / 100) }));

  return (
    <section className="card">
      <div className="card-head">
        <h2>Daily protocol</h2>
        <span className={`count ${done === HABITS.length ? "full" : ""}`}>
          {done}/{HABITS.length}
        </span>
      </div>
      <div className="habits">
        {HABITS.map((h) => {
          const on = !!day.habits[h.id];
          return (
            <button key={h.id} type="button" className={`habit ${on ? "on" : ""}`} aria-pressed={on} onClick={() => toggle(h.id)}>
              <span className="habit-box">
                <I.Check size={14} strokeWidth={3.5} />
              </span>
              <span className="habit-text">
                <b>{h.label}</b>
                <small>{h.hint}</small>
              </span>
            </button>
          );
        })}
      </div>
      <div className="intake">
        <div className="intake-item">
          <Ring value={protein} max={goals.protein} size={54} stroke={5} color="var(--c-pull)">
            <span className="ring-small">{Math.round((protein / goals.protein) * 100)}%</span>
          </Ring>
          <div className="intake-text">
            <b>
              {protein}
              <small>/{goals.protein}g</small>
            </b>
            <span>Protein</span>
          </div>
          <button type="button" className="btn btn-sm btn-soft" onClick={() => go("fuel")}>
            Log meal
          </button>
        </div>
        <div className="intake-item">
          <Ring value={day.water} max={goals.water} size={54} stroke={5} color="var(--c-pull)">
            <I.Droplet size={18} className="ring-icon" />
          </Ring>
          <div className="intake-text">
            <b>
              {+day.water.toFixed(2)}
              <small>/{goals.water}L</small>
            </b>
            <span>Water</span>
          </div>
          <div className="mini-steps">
            <button type="button" className="icon-btn sm" aria-label="Remove 250 ml water" onClick={() => water(-0.25)} disabled={!day.water}>
              <I.Minus size={16} />
            </button>
            <button type="button" className="icon-btn sm filled" aria-label="Add 250 ml water" onClick={() => water(0.25)}>
              <I.Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
