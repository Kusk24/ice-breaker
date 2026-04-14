import type { CSSProperties } from "react";
import ConstellationBack from "../components/ConstellationBack";
import ConstellationStars from "../components/ConstellationStars";

/* Dense starfield — more stars, varied sizes */
const bgStars = Array.from({ length: 180 }, (_, i) => ({
  x: (i * 13 + 7) % 100,
  y: (i * 29 + 3) % 100,
  size: 1 + ((i * 7) % 3),
  delay: `${(i % 12) * 0.4}s`,
  duration: `${2.5 + ((i * 11) % 20) / 10}s`,
}));

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

      {/* Interactive Gemini constellation + Energy locator */}
      <ConstellationStars />

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
