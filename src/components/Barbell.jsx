// Loaded-barbell illustration in competition plate colors.

const SPEC = {
  25: { h: 104, t: 20, c: "#e5484d" },
  20: { h: 104, t: 17, c: "#3e63dd" },
  15: { h: 92, t: 15, c: "#f5c52b" },
  10: { h: 78, t: 13, c: "#30a46c" },
  5: { h: 58, t: 10, c: "#e8e8e3" },
  2.5: { h: 44, t: 8, c: "#2b2b30" },
  1.25: { h: 36, t: 6, c: "#a1a1aa" },
};

export default function Barbell({ perSide, height = 120 }) {
  const W = 360;
  const H = 120;
  const cy = H / 2;
  const sleeve = 86;
  const total = perSide.reduce((s, p) => s + SPEC[p].t + 1.5, 0);
  const k = total > sleeve - 6 ? (sleeve - 6) / total : 1;

  const right = [];
  let xr = W - sleeve - 3;
  for (const [i, p] of perSide.entries()) {
    const s = SPEC[p];
    const t = s.t * k;
    right.push({ key: i, x: xr, t, ...s, p });
    xr += t + 1.5 * k;
  }

  return (
    <svg className="barbell" viewBox={`0 0 ${W} ${H}`} style={{ height }} role="img" aria-label={perSide.length ? `Each side: ${perSide.join(" + ")} kg` : "Empty bar"}>
      {/* shaft + sleeves */}
      <rect x={sleeve + 12} y={cy - 3} width={W - 2 * sleeve - 24} height={6} rx={3} className="bb-shaft" />
      <rect x={4} y={cy - 6} width={sleeve} height={12} rx={3} className="bb-sleeve" />
      <rect x={W - sleeve - 4} y={cy - 6} width={sleeve} height={12} rx={3} className="bb-sleeve" />
      <rect x={sleeve + 4} y={cy - 12} width={8} height={24} rx={2} className="bb-collar" />
      <rect x={W - sleeve - 12} y={cy - 12} width={8} height={24} rx={2} className="bb-collar" />
      {right.map(({ key, x, ...pl }) => (
        <g key={key}>
          <Plate {...pl} x={x} cy={cy} />
          <Plate {...pl} x={W - x - pl.t} cy={cy} />
        </g>
      ))}
    </svg>
  );
}

function Plate({ x, t, h, c, p, cy }) {
  return (
    <g className="bb-plate">
      <rect x={x} y={cy - h / 2} width={t} height={h} rx={Math.min(3.5, t / 2)} fill={c} stroke={p === 2.5 ? "#5a5a63" : "rgba(0,0,0,.28)"} strokeWidth="1" />
      <rect x={x + 1.5} y={cy - h / 2 + 3} width={Math.max(1, t * 0.22)} height={h - 6} rx={1} fill="#fff" opacity="0.22" />
    </g>
  );
}
