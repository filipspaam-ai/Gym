import { useCallback, useEffect, useState } from "react";
import { TYPE_META } from "./data/plan";
import { dayKey, fmtClock } from "./lib/dates";
import { useDay } from "./lib/day";
import { useNow, useToday } from "./lib/hooks";
import { unlockAudio } from "./lib/sound";
import { useStored } from "./lib/store";
import { findPRs, latestBodyKg, newWorkout } from "./lib/training";
import { Toaster, toast } from "./components/ui";
import * as I from "./components/Icons";
import Today from "./screens/Today";
import Train from "./screens/Train";
import Stats from "./screens/Stats";
import Fuel from "./screens/Fuel";
import Guide from "./screens/Guide";
import WorkoutMode, { Summary } from "./screens/WorkoutMode";
import StretchMode from "./screens/StretchMode";

const TABS = [
  { id: "today", label: "Today", icon: I.Zap },
  { id: "train", label: "Train", icon: I.Dumbbell },
  { id: "stats", label: "Progress", icon: I.Chart },
  { id: "fuel", label: "Fuel", icon: I.Apple },
  { id: "guide", label: "Guide", icon: I.Book },
];

const RESUME_WINDOW_MS = 3 * 60 * 60 * 1000;

function readHash() {
  const [tab, sub] = window.location.hash.replace(/^#/, "").split("/");
  return { tab: TABS.some((t) => t.id === tab) ? tab : "today", sub: sub || null };
}

function useTheme(theme) {
  const [resolved, setResolved] = useState(() => document.documentElement.dataset.theme || "dark");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      const t = theme === "auto" ? (mq.matches ? "light" : "dark") : theme;
      document.documentElement.dataset.theme = t;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f3f3ef" : "#0a0a0c");
      setResolved(t);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  return resolved;
}

export default function App() {
  const [active, setActive] = useStored("active");
  const [sessions, setSessions] = useStored("sessions");
  const [weights] = useStored("weights");
  const [theme, setTheme] = useStored("theme");
  const [route, setRoute] = useState(readHash);
  // Reopen a workout that was interrupted by a refresh or app switch.
  const [overlay, setOverlay] = useState(() => (active && Date.now() - active.startedAt < RESUME_WINDOW_MS ? { kind: "workout" } : null));
  const todayKey = useToday();
  const [, updateToday] = useDay(todayKey);
  const resolvedTheme = useTheme(theme);

  useEffect(() => {
    const onHash = () => {
      setRoute(readHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((tab, sub = null) => {
    const hash = `#${tab}${sub ? `/${sub}` : ""}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    setRoute({ tab, sub });
    window.scrollTo(0, 0);
  }, []);

  const startWorkout = (type) => {
    unlockAudio();
    if (active && active.type !== type) {
      if (!window.confirm(`Replace your in-progress ${TYPE_META[active.type].name.toLowerCase()} workout? Its sets won't be saved.`)) return;
    }
    if (!active || active.type !== type) setActive(newWorkout(type, sessions));
    setOverlay({ kind: "workout" });
  };

  const resume = () => {
    unlockAudio();
    setOverlay({ kind: "workout" });
  };

  const finish = () => {
    if (!active) return;
    const session = {
      id: String(active.startedAt),
      type: active.type,
      date: dayKey(new Date(active.startedAt)),
      startedAt: active.startedAt,
      endedAt: Date.now(),
      bodyKg: latestBodyKg(weights),
      exercises: active.exercises
        .map((e) => ({ name: e.name, equip: e.equip, sets: e.sets.filter((s) => s.done).map(({ w, r }) => ({ w, r })) }))
        .filter((e) => e.sets.length),
    };
    const prs = findPRs(session, sessions);
    setSessions((list) => [...list, session]);
    setActive(null);
    setOverlay({ kind: "summary", session, prs });
  };

  const discard = () => {
    setActive(null);
    setOverlay(null);
    toast("Workout discarded");
  };

  const startStretch = (type) => {
    unlockAudio();
    setOverlay({ kind: "stretch", type });
  };

  // Finishing a guided stretch ticks the matching daily-protocol habits.
  const stretchDone = useCallback(
    (items) => {
      const names = items.map((i) => i.name).join(" ");
      updateToday((d) => ({
        ...d,
        habits: {
          ...d.habits,
          ...(/Dead Hang/.test(names) && { hang: true }),
          ...(/Squat Hold/.test(names) && { squat: true }),
          ...(/Thoracic/.test(names) && { thoracic: true }),
        },
      }));
    },
    [updateToday]
  );

  const screenProps = { todayKey, active, go, onStart: startWorkout, onResume: resume, onStretch: startStretch };

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => go("today")} aria-label="Training System — go to Today">
          <Logo />
          <span>Training System</span>
        </button>
        <button type="button" className="icon-btn" aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          {resolvedTheme === "dark" ? <I.Sun size={19} /> : <I.Moon size={19} />}
        </button>
      </header>

      <main className="screen" key={route.tab}>
        {route.tab === "today" && <Today {...screenProps} />}
        {route.tab === "train" && <Train {...screenProps} />}
        {route.tab === "stats" && <Stats todayKey={todayKey} />}
        {route.tab === "fuel" && <Fuel todayKey={todayKey} />}
        {route.tab === "guide" && <Guide todayKey={todayKey} sub={route.sub} setSub={(s) => go("guide", s)} />}
      </main>

      {active && !overlay && <ResumeBar active={active} onResume={resume} onDiscard={() => window.confirm("Discard the workout in progress?") && discard()} />}

      <nav className="dock" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`dock-btn ${route.tab === t.id ? "on" : ""}`} aria-current={route.tab === t.id ? "page" : undefined} onClick={() => go(t.id)}>
            <t.icon size={21} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {overlay?.kind === "workout" && active && (
        <WorkoutMode active={active} setActive={setActive} onMinimize={() => setOverlay(null)} onFinish={finish} onDiscard={discard} />
      )}
      {overlay?.kind === "summary" && (
        <Summary session={overlay.session} prs={overlay.prs} onClose={() => setOverlay(null)} onStretch={() => startStretch(overlay.session.type)} />
      )}
      {overlay?.kind === "stretch" && <StretchMode type={overlay.type} onClose={() => setOverlay(null)} onComplete={stretchDone} />}

      <Toaster />
    </div>
  );
}

function ResumeBar({ active, onResume, onDiscard }) {
  const now = useNow(1000);
  const done = active.exercises.flatMap((e) => e.sets).filter((s) => s.done).length;
  return (
    <div className={`resume t-${active.type}`}>
      <button type="button" className="resume-main" onClick={onResume}>
        <span className="pulse" aria-hidden="true" />
        <span className="resume-text">
          <b>{TYPE_META[active.type].long} in progress</b>
          <small className="mono">
            {fmtClock((now - active.startedAt) / 1000)} · {done} sets done
          </small>
        </span>
        <span className="resume-go">
          Resume <I.ChevronRight size={16} />
        </span>
      </button>
      <button type="button" className="icon-btn sm ghost" aria-label="Discard workout" onClick={onDiscard}>
        <I.X size={16} />
      </button>
    </div>
  );
}

function Logo() {
  return (
    <svg className="logo" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--f-push)" />
      <g fill="#0a0a0c">
        <rect x="5.5" y="10" width="3.5" height="12" rx="1.2" />
        <rect x="9.5" y="12.5" width="2.5" height="7" rx="1" />
        <rect x="12" y="14.8" width="8" height="2.4" rx="1" />
        <rect x="20" y="12.5" width="2.5" height="7" rx="1" />
        <rect x="23" y="10" width="3.5" height="12" rx="1.2" />
      </g>
    </svg>
  );
}
