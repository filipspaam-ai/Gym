import { useId, useState } from "react";
import { useWidth } from "../lib/hooks";

// Responsive single-series line chart with area fill, optional goal line, and tap/hover readout.
// points: [{ t: number (ms), v: number, label: string }]
export default function LineChart({ points, height = 180, color = "var(--accent)", goal, goalLabel, format = (v) => v.toFixed(1), unit = "" }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const gid = useId().replace(/:/g, "");

  const pad = { l: 10, r: 44, t: 18, b: 26 };
  const vs = points.map((p) => p.v);
  let lo = Math.min(...vs, goal ?? Infinity);
  let hi = Math.max(...vs, goal ?? -Infinity);
  if (hi - lo < 2) {
    const mid = (hi + lo) / 2;
    lo = mid - 1;
    hi = mid + 1;
  }
  const span = hi - lo;
  lo -= span * 0.12;
  hi += span * 0.12;

  const ts = points.map((p) => p.t);
  const t0 = Math.min(...ts);
  const t1 = Math.max(...ts);
  const iw = Math.max(0, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const x = (t) => pad.l + (t1 === t0 ? iw / 2 : ((t - t0) / (t1 - t0)) * iw);
  const y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * ih;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
  const area = points.length > 1 ? `${line}L${x(t1).toFixed(1)},${pad.t + ih}L${x(t0).toFixed(1)},${pad.t + ih}Z` : "";
  const ticks = [hi - span * 0.12, (hi + lo) / 2, lo + span * 0.12];

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best = 0;
    for (let i = 1; i < points.length; i++) if (Math.abs(x(points[i].t) - px) < Math.abs(x(points[best].t) - px)) best = i;
    setHover(best);
  };

  const hp = hover != null ? points[hover] : null;

  return (
    <div className="chart" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`Chart of ${points.length} entries, latest ${format(points[points.length - 1].v)}${unit}`}>
          <defs>
            <linearGradient id={`g${gid}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((v, i) => (
            <g key={i}>
              <line x1={pad.l} x2={pad.l + iw} y1={y(v)} y2={y(v)} className="chart-grid" />
              <text x={width - 4} y={y(v) + 4} textAnchor="end" className="chart-tick">
                {format(v)}
              </text>
            </g>
          ))}
          {goal != null && (
            <g>
              <line x1={pad.l} x2={pad.l + iw} y1={y(goal)} y2={y(goal)} className="chart-goal" />
              <text x={pad.l + 4} y={y(goal) - 6} className="chart-goal-label">
                {goalLabel ?? `Goal ${format(goal)}${unit}`}
              </text>
            </g>
          )}
          {area && <path d={area} fill={`url(#g${gid})`} />}
          <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={x(p.t)} cy={y(p.v)} r={i === points.length - 1 || i === hover ? 4.5 : 2.5} fill={i === hover ? color : "var(--surface)"} stroke={color} strokeWidth="2" />
          ))}
          {hp && <line x1={x(hp.t)} x2={x(hp.t)} y1={pad.t} y2={pad.t + ih} className="chart-cursor" />}
          <text x={pad.l} y={height - 6} className="chart-tick">
            {points[0].label}
          </text>
          {points.length > 1 && (
            <text x={pad.l + iw} y={height - 6} textAnchor="end" className="chart-tick">
              {points[points.length - 1].label}
            </text>
          )}
        </svg>
      )}
      {hp && (
        <div className="chart-tip" style={{ left: Math.min(Math.max(x(hp.t), 50), width - 50), top: Math.max(y(hp.v) - 44, 0) }}>
          <strong>
            {format(hp.v)}
            {unit}
          </strong>
          <span>{hp.label}</span>
        </div>
      )}
    </div>
  );
}
