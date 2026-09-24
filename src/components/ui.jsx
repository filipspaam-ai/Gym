import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown, Minus, Plus } from "./Icons";

export function Ring({ value, max = 1, size = 64, stroke = 6, color = "var(--accent)", children, className = "" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, max ? value / max : 0));
  const mid = size / 2;
  return (
    <div className={`ring ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        {p > 0 && (
          <circle
            className="ring-arc"
            cx={mid}
            cy={mid}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - p)}
            transform={`rotate(-90 ${mid} ${mid})`}
          />
        )}
      </svg>
      {children != null && <div className="ring-in">{children}</div>}
    </div>
  );
}

// Snap to the nearest `quantum` (0.25 for plate math, 0.1 for body weight, 1 for reps).
const snap = (n, q) => +(Math.round(n / q) * q).toFixed(2);

export function Stepper({ value, onChange, step = 1, min = 0, label, integer = false, quantum = integer ? 1 : 0.25, prefix }) {
  const [draft, setDraft] = useState(null);
  const clean = (n) => snap(n, quantum);
  const commit = () => {
    if (draft == null) return;
    const n = parseFloat(draft.replace(",", "."));
    if (!Number.isNaN(n)) onChange(Math.max(min, clean(n)));
    setDraft(null);
  };
  return (
    <div className="stepper">
      <button type="button" className="stepper-btn" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, clean(value - step)))}>
        <Minus size={16} strokeWidth={2.5} />
      </button>
      <label className="stepper-field">
        {prefix && <span className="stepper-prefix">{prefix}</span>}
        <input
          inputMode={integer ? "numeric" : "decimal"}
          aria-label={label}
          value={draft ?? String(value)}
          onFocus={(e) => {
            setDraft(String(value));
            const el = e.target;
            requestAnimationFrame(() => el.select());
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
      </label>
      <button type="button" className="stepper-btn" aria-label={`Increase ${label}`} onClick={() => onChange(clean(value + step))}>
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function Segmented({ options, value, onChange, label }) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="seg" role="tablist" aria-label={label} style={{ "--n": options.length, "--i": idx }}>
      <span className="seg-ind" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={`seg-btn ${o.value === value ? "on" : ""} ${o.className ?? ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Disclosure({ head, children, defaultOpen = false, className = "" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`disc ${open ? "open" : ""} ${className}`}>
      <button type="button" className="disc-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <div className="disc-title">{head}</div>
        <ChevronDown className="disc-chev" size={18} />
      </button>
      <div className="disc-body" inert={!open}>
        <div className="disc-inner">{children}</div>
      </div>
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty-icon">
          <Icon size={22} />
        </div>
      )}
      <div className="empty-title">{title}</div>
      {children && <div className="empty-body">{children}</div>}
    </div>
  );
}

// ——— Toasts ———
let toasts = [];
const toastListeners = new Set();
const emitToasts = () => toastListeners.forEach((fn) => fn());
let toastId = 0;

export function toast(message, tone = "default") {
  const id = ++toastId;
  toasts = [...toasts.slice(-2), { id, message, tone }];
  emitToasts();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitToasts();
  }, 2600);
}

export function Toaster() {
  const list = useSyncExternalStore(
    (fn) => {
      toastListeners.add(fn);
      return () => toastListeners.delete(fn);
    },
    () => toasts
  );
  return (
    <div className="toaster" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// Lock page scroll while a full-screen overlay is open.
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}
