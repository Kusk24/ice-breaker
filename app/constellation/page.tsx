import type { CSSProperties } from "react";
import ConstellationBack from "../components/ConstellationBack";

/* Dense starfield — more stars, varied sizes */
const bgStars = Array.from({ length: 180 }, (_, i) => ({
  x: (i * 13 + 7) % 100,
  y: (i * 29 + 3) % 100,
  size: 1 + ((i * 7) % 3),
  delay: `${(i % 12) * 0.4}s`,
  duration: `${2.5 + ((i * 11) % 20) / 10}s`,
}));

/* Gemini constellation — bigger coordinates for full-page */
const geminiStars: Array<{ x: number; y: number; size: "lg" | "md" | "sm" }> = [
  { x: 28, y: 18, size: "lg" },
  { x: 35, y: 20, size: "md" },
  { x: 44, y: 24, size: "lg" },
  { x: 54, y: 28, size: "md" },
  { x: 60, y: 27, size: "lg" },
  { x: 25, y: 28, size: "md" },
  { x: 27, y: 36, size: "sm" },
  { x: 37, y: 42, size: "md" },
  { x: 43, y: 46, size: "lg" },
  { x: 55, y: 52, size: "md" },
  { x: 56, y: 42, size: "sm" },
  { x: 50, y: 62, size: "lg" },
];

const geminiLines = [
  "M 28,18 L 35,20 L 44,24 L 54,28 L 60,27",
  "M 28,18 L 25,28 L 27,36 L 37,42 L 43,46 L 55,52",
  "M 54,28 L 56,42 L 55,52 L 50,62",
];

/* Faint nebula clouds */
const nebulaClouds = [
  { x: 20, y: 30, w: 35, h: 25, rot: -12, color: "rgba(80,120,255,0.04)" },
  { x: 45, y: 15, w: 30, h: 20, rot: 8, color: "rgba(140,100,255,0.035)" },
  { x: 55, y: 45, w: 28, h: 22, rot: -5, color: "rgba(100,140,255,0.03)" },
];

/* Shooting stars */
const shootingStars = Array.from({ length: 5 }, (_, i) => ({
  x: 15 + ((i * 37) % 70),
  y: 5 + ((i * 23) % 30),
  delay: `${3 + i * 4.5}s`,
  duration: `${0.8 + (i % 3) * 0.3}s`,
  angle: 25 + ((i * 11) % 20),
}));

export default function ConstellationPage() {
  return (
    <main className="scene constellation-scene" aria-label="Gemini constellation deep space view">
      {/* Deep space background stars */}
      <div className="constellation-bg" aria-hidden>
        {bgStars.map((s, i) => (
          <span
            key={`bg-${i}`}
            className="constellation-bg__star"
            style={{
              "--sx": s.x,
              "--sy": s.y,
              "--ss": `${s.size}px`,
              "--sd": s.delay,
              "--sdu": s.duration,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* Nebula clouds */}
      <div className="constellation-nebula" aria-hidden>
        {nebulaClouds.map((c, i) => (
          <div
            key={`neb-${i}`}
            className="constellation-nebula__cloud"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.w}%`,
              height: `${c.h}%`,
              transform: `rotate(${c.rot}deg)`,
              background: `radial-gradient(ellipse, ${c.color} 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="constellation-shooting" aria-hidden>
        {shootingStars.map((s, i) => (
          <span
            key={`shoot-${i}`}
            className="constellation-shooting__star"
            style={{
              "--shx": `${s.x}%`,
              "--shy": `${s.y}%`,
              "--sha": `${s.angle}deg`,
              "--shd": s.delay,
              "--shdu": s.duration,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* Main Gemini constellation — full viewport SVG */}
      <svg
        className="constellation-main"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="c-glow-lg" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="c-glow-md" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <filter id="c-glow-line" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>

        {/* Constellation lines — draw in on load */}
        {geminiLines.map((d, i) => (
          <g key={`line-${i}`}>
            {/* Glow layer */}
            <path
              d={d}
              className="constellation-main__line constellation-main__line--glow"
              style={{ "--li": i } as CSSProperties}
              pathLength={1}
              filter="url(#c-glow-line)"
            />
            {/* Crisp layer */}
            <path
              d={d}
              className="constellation-main__line"
              style={{ "--li": i } as CSSProperties}
              pathLength={1}
            />
          </g>
        ))}

        {/* Star nodes */}
        {geminiStars.map((s, i) => (
          <g
            key={`gstar-${i}`}
            className="constellation-main__star"
            style={{ "--si": i } as CSSProperties}
          >
            {/* Outer glow */}
            <circle
              cx={s.x} cy={s.y}
              r={s.size === "lg" ? 2.2 : s.size === "md" ? 1.6 : 1.2}
              fill="#4d94ff"
              filter="url(#c-glow-lg)"
              opacity="0.6"
            />
            {/* Mid glow */}
            <circle
              cx={s.x} cy={s.y}
              r={s.size === "lg" ? 1.1 : s.size === "md" ? 0.8 : 0.6}
              fill="#8cbfff"
              filter="url(#c-glow-md)"
              opacity="0.85"
            />
            {/* Core */}
            <circle
              cx={s.x} cy={s.y}
              r={s.size === "lg" ? 0.5 : s.size === "md" ? 0.38 : 0.28}
              fill="#ffffff"
            />
          </g>
        ))}

        {/* Gemini symbol at bottom center */}
        <g className="constellation-main__symbol" transform="translate(43, 78) scale(0.18)">
          <circle cx="0" cy="0" r="42" fill="none" stroke="#7bb4ff" strokeWidth="1.5" opacity="0.85" />
          <circle cx="0" cy="0" r="42" fill="none" stroke="#7bb4ff" strokeWidth="3" filter="url(#c-glow-md)" opacity="0.4" />
          <g stroke="#7bb4ff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M -22 -20 Q 0 -4 22 -20" />
            <path d="M -22 20 Q 0 4 22 20" />
            <line x1="-9" y1="-12" x2="-9" y2="12" />
            <line x1="9" y1="-12" x2="9" y2="12" />
          </g>
        </g>
      </svg>

      {/* Title */}
      <h1 className="constellation-title">
        {["G","e","m","i","n","i"].map((ch, i) => (
          <span key={i} className="constellation-title__char" style={{ "--ci": i } as CSSProperties}>
            {ch}
          </span>
        ))}
      </h1>

      {/* Back button */}
      <ConstellationBack />
    </main>
  );
}
