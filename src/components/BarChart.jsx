import React from "react";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
export default function BarChart({ data, fmt }) {
  const W = 600, H = 240, pad = { l: 8, r: 8, t: 22, b: 28 };
  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  const bw = (W - pad.l - pad.r) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#e2e8f0" />
      {data.map((d, i) => {
        const h = (d.value / max) * (H - pad.t - pad.b);
        const x = pad.l + i * bw + bw * 0.15, y = H - pad.b - h, cx = x + bw * 0.35;
        return (
          <g key={i}>
            <title>{`${d.label}: ${fmt(d.value)}`}</title>
            <rect x={x} y={y} width={bw * 0.7} height={d.value > 0 ? Math.max(h, 2) : 0} rx="4" fill="#6366f1" />
            {d.value > 0 && data.length <= 12 && <text x={cx} y={y - 5} textAnchor="middle" fontSize="10" fill="#64748b">{compact.format(d.value)}</text>}
            <text x={cx} y={H - 9} textAnchor="middle" fontSize="11" fill="#64748b">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
