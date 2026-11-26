import React from "react";
import { gearPath } from "./Gear";

const BLUE = "#1e88d0", GOLD = "#f2b01e", NAVY = "#0f2547", MID = "#1b3a66", LIGHT = "#234a82";

function Roll({ x, y, w = 58, h = 40, c }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="5" fill={c} />
      <rect y={h * 0.62} width={w} height={h * 0.38} rx="5" fill="#000" opacity=".18" />
      <ellipse cx="4" cy={h / 2} rx="8" ry={h / 2} fill={c} stroke="#fff" strokeOpacity=".35" />
      <ellipse cx="4" cy={h / 2} rx="3" ry="7" fill={NAVY} />
    </g>
  );
}

function Bag({ x, y, c, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M9 2 C9 -12 17 -12 17 2 M25 2 C25 -12 33 -12 33 2" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect y="0" width="42" height="46" rx="4" fill={c} />
      <rect x="30" width="12" height="46" rx="4" fill="#000" opacity=".14" />
      <path d="M6 12h30" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
      <circle cx="21" cy="28" r="7" fill="#fff" opacity=".7" /><circle cx="21" cy="28" r="3" fill={NAVY} />
    </g>
  );
}

// animated plastic factory: blown-film tower (bubble rising), extruder with falling pellets, bags on a conveyor
export function FactoryScene({ className = "" }) {
  return (
    <svg viewBox="0 0 640 360" className={className} role="img" aria-label="Plastic film and bag factory">
      <defs>
        <linearGradient id="fs-gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#12305c" /><stop offset="1" stopColor="#081833" /></linearGradient>
        <linearGradient id="fs-film" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7cc4ee" stopOpacity=".15" /><stop offset=".5" stopColor="#d4efff" stopOpacity=".75" /><stop offset="1" stopColor="#7cc4ee" stopOpacity=".15" /></linearGradient>
        <clipPath id="fs-belt"><rect x="0" y="232" width="640" height="88" /></clipPath>
      </defs>
      <g fill="#fff" opacity=".1">
        <path className="gear-slow" style={{ transformOrigin: "90px 70px" }} d={gearPath(90, 70, 14, 62, 52, 20)} fillRule="evenodd" />
        <path className="gear-slow-rev" style={{ transformOrigin: "205px 40px" }} d={gearPath(205, 40, 9, 34, 28, 11, 0.2)} fillRule="evenodd" />
      </g>
      {/* background plant + chimney */}
      <g opacity=".6">
        <rect x="250" y="80" width="22" height="220" fill={LIGHT} /><rect x="250" y="80" width="22" height="8" fill={GOLD} />
        {[0, 1.5, 3].map((d, i) => <circle key={i} className="smoke" style={{ animationDelay: `${d}s` }} cx="261" cy="72" r="12" fill="#cbd5e1" />)}
        <path d="M20 190 L20 150 L90 190 L90 150 L160 190 L160 150 L230 190 L230 150 L300 190 V300 H20Z" fill={MID} />
        {[36, 106, 176].map((x, i) => <rect key={x} className="glow" style={{ animationDelay: `${i * 0.6}s` }} x={x} y="215" width="50" height="26" rx="3" fill={GOLD} />)}
      </g>
      {/* extruder */}
      <rect x="120" y="230" width="276" height="20" fill={NAVY} />
      <rect x="110" y="188" width="50" height="52" rx="6" fill={LIGHT} />
      <g fill={GOLD}><path className="spin-a" style={{ transformOrigin: "135px 214px" }} d={gearPath(135, 214, 8, 15, 11, 4.5)} fillRule="evenodd" /></g>
      <rect x="150" y="196" width="246" height="34" rx="6" fill={BLUE} />
      {[196, 244, 292, 340].map((x) => <rect key={x} x={x} y="196" width="10" height="34" fill={GOLD} />)}
      <path d="M190 130 H250 L232 196 H208Z" fill={GOLD} /><path d="M190 130 H250" stroke="#fff" strokeOpacity=".5" strokeWidth="3" />
      {[[212, 0], [220, .45], [228, .9], [222, 1.35]].map(([x, d], i) => <circle key={i} className="drop" style={{ animationDelay: `${d}s` }} cx={x} cy="118" r="3.5" fill="#fff" />)}
      <circle className="glow" cx="176" cy="204" r="3.5" fill="#4ade80" />
      {/* blown-film tower */}
      <rect x="372" y="246" width="108" height="6" fill={NAVY} />
      <rect x="378" y="30" width="8" height="218" fill={LIGHT} /><rect x="458" y="30" width="8" height="218" fill={LIGHT} />
      <rect x="396" y="204" width="48" height="18" rx="3" fill={GOLD} />
      <path className="bubble" d="M400 204 C380 176 384 132 404 102 H436 C456 132 460 176 440 204Z" fill="url(#fs-film)" stroke="#fff" strokeOpacity=".45" />
      <ellipse className="glow" cx="420" cy="192" rx="34" ry="6" fill="none" stroke={GOLD} strokeWidth="4" />
      <path d="M404 102 L386 84 M436 102 L454 84" stroke="#fff" strokeOpacity=".55" strokeWidth="3" />
      <rect x="408" y="40" width="24" height="40" fill="url(#fs-film)" />
      <path className="film-up" d="M420 40 V78" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeDasharray="6 8" />
      <circle cx="412" cy="82" r="7" fill="#e2e8f0" /><circle cx="428" cy="82" r="7" fill="#e2e8f0" />
      <rect x="376" y="30" width="92" height="10" rx="5" fill={GOLD} />
      {/* ground + bag conveyor */}
      <rect x="0" y="300" width="640" height="60" fill="url(#fs-gnd)" />
      <g clipPath="url(#fs-belt)"><g className="belt">
        {[0, 1, 2, 3, 4, 5].map((i) => <React.Fragment key={i}><Bag x={i * 160 + 20} y={254} c={BLUE} /><Bag x={i * 160 + 100} y={262} c={GOLD} s={0.8} /></React.Fragment>)}
      </g></g>
      <rect x="0" y="298" width="640" height="14" fill={NAVY} /><rect x="0" y="298" width="640" height="3" fill={GOLD} opacity=".85" />
      {[...Array(21)].map((_, i) => <circle key={i} cx={15 + i * 30} cy="330" r="5" fill="#fff" opacity=".12" />)}
    </svg>
  );
}

// card art: production line (extruder + bubble tower)
export function MachineArt({ className = "" }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Production line">
      <rect width="320" height="200" fill="#0b1d3a" />
      <rect y="168" width="320" height="32" fill={NAVY} />
      <path d="M32 40 L74 40 L62 78 L44 78Z" fill={GOLD} />
      <rect x="22" y="78" width="130" height="34" rx="6" fill={BLUE} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${34 + i * 15} 80 l8 30`} stroke="#fff" strokeOpacity=".35" strokeWidth="3" />)}
      <rect x="150" y="70" width="34" height="50" rx="4" fill={MID} />
      <rect x="6" y="72" width="30" height="62" rx="5" fill={LIGHT} />
      <rect x="6" y="134" width="170" height="34" rx="5" fill={LIGHT} />
      <path d="M184 95 h16 v-4 h26 v-6" stroke={MID} strokeWidth="12" fill="none" />
      <rect x="205" y="30" width="44" height="12" rx="3" fill={GOLD} />
      <rect x="215" y="42" width="24" height="126" fill={BLUE} opacity=".35" /><rect x="223" y="42" width="8" height="126" fill="#fff" opacity=".4" />
      <rect x="250" y="40" width="50" height="14" rx="7" fill={GOLD} /><rect x="268" y="54" width="14" height="14" fill={MID} />
      <circle cx="275" cy="150" r="20" fill="#e2e8f0" /><circle cx="275" cy="150" r="7" fill={NAVY} />
      <g fill={GOLD}><path className="spin-a" style={{ transformOrigin: "36px 152px" }} d={gearPath(36, 152, 9, 15, 11.5, 4.5)} fillRule="evenodd" /></g>
      <g fill="#fff" opacity=".85"><path className="spin-b" style={{ transformOrigin: "66px 152px" }} d={gearPath(66, 152, 7, 11, 8, 3.5, 0.2)} fillRule="evenodd" /></g>
      <circle className="glow" cx="168" cy="82" r="4" fill="#4ade80" />
    </svg>
  );
}

// card art: colored film rolls on a pallet
export function RollsArt({ className = "" }) {
  const R = ({ x, y, c, w = 120, h = 46 }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="6" fill={c} />
      <rect y={h * 0.6} width={w} height={h * 0.4} rx="6" fill="#000" opacity=".16" />
      <ellipse cx="6" cy={h / 2} rx="10" ry={h / 2} fill={c} stroke="#fff" strokeOpacity=".4" /><ellipse cx="6" cy={h / 2} rx="4" ry="9" fill={NAVY} />
      <rect x="40" width="14" height={h} fill="#fff" opacity=".18" />
    </g>
  );
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Film rolls">
      <rect width="320" height="200" fill="#0b1d3a" />
      <g className="float-y">
        <R x="70" y="40" c={BLUE} /><R x="70" y="90" c={GOLD} /><R x="70" y="140" c="#e2e8f0" />
        <R x="190" y="150" c={GOLD} w="90" h="34" />
      </g>
      <Bag x="236" y="88" c={BLUE} s={0.9} /><Bag x="262" y="100" c="#e2e8f0" s={0.7} />
      <rect x="40" y="186" width="200" height="8" rx="2" fill="#7c5a2b" /><rect x="40" y="198" width="200" height="2" fill="#5a4120" />
    </svg>
  );
}

// card art: quality check (scanner over a film sheet + shield with check)
export function QualityArt({ className = "" }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Quality control">
      <rect width="320" height="200" fill="#0b1d3a" />
      <rect x="40" y="38" width="170" height="124" rx="8" fill={BLUE} opacity=".35" stroke="#fff" strokeOpacity=".4" />
      {[...Array(6)].map((_, i) => <path key={i} d={`M48 ${58 + i * 20}h154`} stroke="#fff" strokeOpacity=".15" />)}
      <g className="scan"><rect x="34" y="42" width="182" height="3" fill="#4ade80" /><rect x="34" y="30" width="182" height="14" fill="#4ade80" opacity=".18" /></g>
      <path className="float-y" d="M262 52 L300 64 V100 C300 124 284 140 262 150 C240 140 224 124 224 100 V64Z" fill={GOLD} />
      <path d="M262 60 L292 70 V100 C292 118 280 131 262 140 C244 131 232 118 232 100 V70Z" fill={BLUE} />
      <path d="M246 100 l12 12 l22 -24" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
