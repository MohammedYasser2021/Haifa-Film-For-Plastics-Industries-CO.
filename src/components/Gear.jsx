import React from "react";

export function gearPath(cx, cy, n, ro, ri, rh, phase = 0) {
  const s = (2 * Math.PI) / n, pts = [];
  for (let i = 0; i < n; i++) {
    const a = phase + i * s;
    [[ri, 0], [ro, 0.18], [ro, 0.42], [ri, 0.6]].forEach(([r, k]) => pts.push(`${(cx + r * Math.cos(a + k * s)).toFixed(1)} ${(cy + r * Math.sin(a + k * s)).toFixed(1)}`));
  }
  const hole = `M${cx + rh} ${cy}A${rh} ${rh} 0 1 0 ${cx - rh} ${cy}A${rh} ${rh} 0 1 0 ${cx + rh} ${cy}Z`;
  return `M${pts.join("L")}Z${hole}`;
}

// single gear, rotates around its centre (add a spin class through className)
export function Gear({ size = 48, teeth = 10, ro = 46, ri = 37, hole = 14, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <path d={gearPath(50, 50, teeth, ro, ri, hole)} fillRule="evenodd" />
    </svg>
  );
}

// two meshing gears turning in opposite directions
export function GearPair({ size = 90, className = "" }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 120 88" className={className} fill="currentColor" role="status" aria-label="loading">
      <path className="spin-a" style={{ transformOrigin: "38px 44px" }} d={gearPath(38, 44, 12, 30, 24, 9)} fillRule="evenodd" />
      <path className="spin-b" style={{ transformOrigin: "83px 44px" }} d={gearPath(83, 44, 8, 21, 15, 6, Math.PI / 8)} fillRule="evenodd" />
    </svg>
  );
}
