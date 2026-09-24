import { useRef, useState, useSyncExternalStore } from "react";
import { DAYS, FLEX_OPTIONS, FLEX_RULES, GROWTH, PROFILE, WEEK, WHY_SPLIT } from "../data/plan";
import { exportAll, importAll, resetAll, useStored } from "../lib/store";
import { dayKey, fromKey, weekdayIdx } from "../lib/dates";
import { platesFor } from "../lib/training";
import { Segmented, Stepper, toast } from "../components/ui";
import Barbell from "../components/Barbell";
import * as I from "../components/Icons";
import { getInstallPrompt, subscribeInstall } from "../lib/install";

const SECTIONS = [
  { value: "week", label: "Week" },
  { value: "flex", label: "Flex" },
  { value: "growth", label: "Growth" },
  { value: "plates", label: "Plates" },
  { value: "app", label: "App" },
];

export default function Guide({ sub, setSub, todayKey }) {
  const section = SECTIONS.some((s) => s.value === sub) ? sub : "week";
  return (
    <div className="stack t-legs">
      <header className="page-head">
        <h1>Guide</h1>
        <p>
          The system behind the plan — {PROFILE.heightCm}cm · {PROFILE.startKg}kg → {PROFILE.goalKg}kg lean.
        </p>
      </header>
      <Segmented label="Guide section" value={section} onChange={setSub} options={SECTIONS} />
      {section === "week" && <Week todayKey={todayKey} />}
      {section === "flex" && <Flex />}
      {section === "growth" && <Growth />}
      {section === "plates" && <Plates />}
      {section === "app" && <AppSettings />}
    </div>
  );
}

function Week({ todayKey }) {
  const todayIdx = weekdayIdx(fromKey(todayKey));
  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>Weekly schedule</h2>
        </div>
        <ul className="schedule">
          {WEEK.map((d, i) => (
            <li key={d.day} className={`t-${d.type} ${i === todayIdx ? "today" : ""}`}>
              <span className="schedule-day">{d.day}</span>
              <span className="schedule-bar" />
              <span className="schedule-main">
                <b>{d.label}</b>
                <small>{DAYS[d.type]?.focus ?? (d.type === "flex" ? "Basketball, run, or pick an option" : "Dead hangs + light stretching")}</small>
              </span>
              <span className="pill">{d.badge}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card callout">
        <div className="callout-icon">
          <I.Info size={18} />
        </div>
        <div>
          <h3>Why this split</h3>
          <p className="body-text">{WHY_SPLIT}</p>
        </div>
      </section>
    </>
  );
}

function Flex() {
  return (
    <>
      <section className="card t-flex">
        <div className="card-head">
          <h2>What to do</h2>
          <span className="muted small">Wed + Sat</span>
        </div>
        <ul className="rules-list">
          {FLEX_RULES.map((r) => (
            <li key={r.s}>
              <b>{r.s}</b>
              <p>{r.r}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="option-grid">
        {FLEX_OPTIONS.map((o) => (
          <section key={o.name} className={`card option t-${o.color}`}>
            <div className="option-head">
              <span className="option-tag">{o.tag}</span>
              {o.best && <span className="pill">Best for growth</span>}
            </div>
            <h3>{o.name}</h3>
            <p className="body-text">{o.detail}</p>
          </section>
        ))}
      </div>
    </>
  );
}

function Growth() {
  return (
    <>
      <p className="lede">
        At {PROFILE.age} you may still have growth plate activity. Maximize your potential with these daily protocols — the ones marked <b>daily</b> are on your Today checklist.
      </p>
      <div className="growth">
        {GROWTH.map((g, i) => (
          <section key={g.title} className="card growth-item t-push">
            <span className="growth-num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3>
                {g.title} {g.daily && <span className="pill">Daily</span>}
              </h3>
              <p className="body-text">{g.detail}</p>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function Plates() {
  const [target, setTarget] = useState(60);
  const [bar, setBar] = useState(20);
  const { perSide, leftover } = platesFor(target, bar);
  const tally = perSide.reduce((m, p) => ({ ...m, [p]: (m[p] || 0) + 1 }), {});

  return (
    <section className="card plates t-push">
      <div className="card-head">
        <h2>Plate calculator</h2>
      </div>
      <div className="plates-controls">
        <Stepper value={target} onChange={setTarget} step={2.5} min={bar} label="Target weight in kg" />
        <Segmented label="Bar weight" value={bar} onChange={setBar} options={[20, 15, 10].map((b) => ({ value: b, label: `${b}kg bar` }))} />
      </div>
      <Barbell perSide={perSide} height={130} />
      <div className="plates-readout">
        {perSide.length ? (
          <>
            <span className="muted small">Each side</span>
            <div className="plate-tally">
              {Object.entries(tally)
                .sort((a, b) => b[0] - a[0])
                .map(([p, n]) => (
                  <span key={p} className={`plate-chip p-${String(p).replace(".", "_")}`}>
                    {n > 1 && <em>{n}×</em>}
                    {p}
                  </span>
                ))}
            </div>
          </>
        ) : (
          <span className="muted">Just the bar.</span>
        )}
        {leftover > 0 && <p className="warn-text">Can't load exactly — {leftover * 2}kg short with standard plates.</p>}
      </div>
    </section>
  );
}

function AppSettings() {
  const [theme, setTheme] = useStored("theme");
  const fileRef = useRef(null);
  const install = useSyncExternalStore(subscribeInstall, getInstallPrompt);
  const standalone = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches;
  const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-backup-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Backup downloaded");
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      importAll(JSON.parse(await file.text()));
      toast("Backup restored", "good");
    } catch (err) {
      toast(err.message || "Couldn't read that file", "bad");
    }
  };

  const doReset = () => {
    if (!window.confirm("Erase all workouts, weigh-ins and daily logs on this device? Export a backup first if you want to keep them.")) return;
    resetAll();
    toast("All data cleared");
  };

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>Appearance</h2>
        </div>
        <Segmented
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "auto", label: "Auto" },
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Install</h2>
        </div>
        {standalone ? (
          <p className="body-text">
            <I.Check size={14} /> Running as an installed app. Works offline at the gym.
          </p>
        ) : install ? (
          <>
            <p className="body-text">Add Training System to your home screen — full-screen, works offline, keeps the screen awake during workouts.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                install.prompt();
                await install.userChoice.catch(() => {});
              }}
            >
              <I.Smartphone size={16} /> Install app
            </button>
          </>
        ) : (
          <p className="body-text">
            {ios ? "In Safari tap Share → Add to Home Screen" : "Use your browser menu → Install app / Add to Home screen"} to run it full-screen and offline at the gym.
          </p>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Your data</h2>
        </div>
        <p className="body-text">Everything is stored privately on this device — no account, no server. Export a backup to move it to another phone.</p>
        <div className="btn-row">
          <button type="button" className="btn btn-soft" onClick={doExport}>
            <I.Download size={16} /> Export
          </button>
          <button type="button" className="btn btn-soft" onClick={() => fileRef.current?.click()}>
            <I.Upload size={16} /> Import
          </button>
          <button type="button" className="btn btn-danger" onClick={doReset}>
            <I.Trash size={16} /> Reset
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={doImport} />
        </div>
      </section>
    </>
  );
}
