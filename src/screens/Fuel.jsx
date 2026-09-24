import { CREATINE, NUTRITION } from "../data/plan";
import { addDays, dayKey, fromKey } from "../lib/dates";
import { dayTotals, useDay } from "../lib/day";
import { parseMeal } from "../lib/parse";
import { useStored } from "../lib/store";
import { Disclosure, Ring, SectionTitle, toast } from "../components/ui";
import * as I from "../components/Icons";

const QUICK = [
  { label: "+10g protein", kcal: 40, protein: 10 },
  { label: "+25g protein", kcal: 100, protein: 25 },
  { label: "+250 kcal", kcal: 250, protein: 0 },
];

export default function Fuel({ todayKey }) {
  const [day, update] = useDay(todayKey);
  const [days] = useStored("days");
  const { kcal, protein } = dayTotals(day);
  const { goals, targets } = NUTRITION;

  const log = (name, macros) => {
    update((d) => ({ ...d, food: [...d.food, { id: Date.now(), name, ...macros }] }));
    toast(`${name} · ${macros.kcal} kcal${macros.protein ? ` · ${macros.protein}g protein` : ""}`);
  };
  const unlog = (id) => update((d) => ({ ...d, food: d.food.filter((f) => f.id !== id) }));
  const creatineOn = !!day.habits.creatine;
  const toggleCreatine = () => update((d) => ({ ...d, habits: { ...d.habits, creatine: !d.habits.creatine } }));

  // Consecutive creatine days, counting back from today (or yesterday if today isn't ticked yet).
  let streak = 0;
  let cur = fromKey(todayKey);
  if (!days[todayKey]?.habits?.creatine) cur = addDays(cur, -1);
  while (days[dayKey(cur)]?.habits?.creatine) {
    streak++;
    cur = addDays(cur, -1);
  }

  return (
    <div className="stack t-flex">
      <header className="page-head">
        <h1>Fuel</h1>
        <p>Lean bulk to {goals.protein}g protein and ~{goals.kcal} kcal. Tap a meal from your plan to log it.</p>
      </header>

      <section className="card intake-hero">
        <div className="intake-rings">
          <Ring value={kcal} max={goals.kcal} size={132} stroke={11} color="var(--c-flex)">
            <div className="ring-big">
              <b>{kcal}</b>
              <span>/ {goals.kcal} kcal</span>
            </div>
          </Ring>
          <Ring value={protein} max={goals.protein} size={96} stroke={9} color="var(--c-pull)">
            <div className="ring-big sm">
              <b>{protein}g</b>
              <span>/ {goals.protein}g</span>
            </div>
          </Ring>
        </div>
        <div className="chips center">
          {QUICK.map((q) => (
            <button key={q.label} type="button" className="chip" onClick={() => log(q.label.replace("+", "Quick "), { kcal: q.kcal, protein: q.protein })}>
              {q.label}
            </button>
          ))}
        </div>
        {day.food.length > 0 && (
          <ul className="food-log">
            {day.food.map((f) => (
              <li key={f.id}>
                <span>{f.name}</span>
                <span className="mono muted">
                  {f.kcal} kcal{f.protein ? ` · ${f.protein}g` : ""}
                </span>
                <button type="button" className="icon-btn sm ghost" aria-label={`Remove ${f.name}`} onClick={() => unlog(f.id)}>
                  <I.X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="macro-grid">
        {[
          { v: targets.cal, l: "kcal / day", c: "flex" },
          { v: targets.pro, l: "Protein", c: "pull" },
          { v: targets.carb, l: "Carbs", c: "push" },
          { v: targets.fat, l: "Fats", c: "legs" },
        ].map((m) => (
          <div key={m.l} className={`macro t-${m.c}`}>
            <b>{m.v}</b>
            <span>{m.l}</span>
          </div>
        ))}
      </div>

      <SectionTitle>Meal plan</SectionTitle>
      {NUTRITION.meals.map((group) => (
        <Disclosure
          key={group.name}
          className="card"
          head={
            <>
              <b>
                <span aria-hidden="true">{group.emoji}</span> {group.name}
              </b>
              <small>{group.opts.length} options</small>
            </>
          }
        >
          <ul className="meals">
            {group.opts.map((o) => {
              const macros = parseMeal(o.d);
              return (
                <li key={o.m}>
                  <div>
                    <b>{o.m}</b>
                    <p>{o.d}</p>
                  </div>
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => log(o.m, macros)} aria-label={`Log ${o.m}`}>
                    <I.Plus size={14} /> Log
                  </button>
                </li>
              );
            })}
          </ul>
        </Disclosure>
      ))}

      <section className="card">
        <div className="card-head">
          <h2>Rules</h2>
        </div>
        <ol className="rules">
          {NUTRITION.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </section>

      <SectionTitle>Creatine</SectionTitle>
      <section className="card creatine t-push">
        <div className="creatine-top">
          <button type="button" className={`creatine-check ${creatineOn ? "on" : ""}`} aria-pressed={creatineOn} onClick={toggleCreatine}>
            <span className="habit-box">
              <I.Check size={16} strokeWidth={3.5} />
            </span>
            {creatineOn ? "Taken today" : "Mark today's 5g"}
          </button>
          <div className="creatine-streak">
            <I.Flame size={16} />
            <b>{streak}</b> day{streak === 1 ? "" : "s"}
          </div>
        </div>
        <p className="tldr">5g creatine monohydrate. Every day. Any time. Mix in water. Don't overthink it. Most effective legal supplement for muscle and strength.</p>
      </section>
      <section className="card faq">
        {CREATINE.map((p) => (
          <Disclosure key={p.q} head={<b>{p.q}</b>}>
            <p className="body-text">{p.a}</p>
          </Disclosure>
        ))}
      </section>
    </div>
  );
}
