"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const T3_FONTS = [
  "serif", "monospace", "'Georgia',serif", "'Impact',sans-serif",
  "'Courier New',monospace", "'Arial Black',sans-serif",
  "'Times New Roman',serif", "fantasy", "cursive",
];
const T3_COLORS = [
  "#FFD766","#FF5A70","#FF8000","#c084fc","#34d399","#f472b6","#60a5fa","#EEF6FF",
];

// 14 scattered pieces with well-spread positions across the full page
const NEBULA_PIECES = [
  { x:  8, y: 12 }, { x: 82, y:  9 }, { x: 25, y: 78 },
  { x: 68, y: 85 }, { x: 91, y: 42 }, { x:  5, y: 58 },
  { x: 47, y:  6 }, { x: 15, y: 32 }, { x: 75, y: 22 },
  { x: 55, y: 68 }, { x: 33, y: 90 }, { x: 88, y: 72 },
  { x: 42, y: 48 }, { x:  3, y: 88 },
].map((pos, i) => ({
  id: i,
  x: pos.x,
  y: pos.y,
  fontSize: `${13 + (i * 53 % 20)}px`,
  font: T3_FONTS[i % T3_FONTS.length],
  color: T3_COLORS[i % T3_COLORS.length],
  rotate: (i * 47) % 360,
  driftDur: `${7 + (i * 37 % 8)}s`,
  driftDelay: `${-(i * 1.3 % 7)}s`,
  opacity: 0.25 + (i % 3) * 0.12,
}));

export default function T3Nebula() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("t3-exploded") === "1") {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="t3-nebula" aria-hidden>
      {/* Gas cloud layers */}
      <div className="t3-nebula__gas t3-nebula__gas--pink" />
      <div className="t3-nebula__gas t3-nebula__gas--blue" />
      <div className="t3-nebula__gas t3-nebula__gas--orange" />
      {/* Floating T3 text pieces */}
      {NEBULA_PIECES.map((p) => (
        <span
          key={p.id}
          className="t3-nebula__piece"
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top:  `${p.y}%`,
            fontFamily: p.font,
            fontSize: p.fontSize,
            color: p.color,
            opacity: p.opacity,
            fontWeight: 900,
            "--rotate": `${p.rotate}deg`,
            "--drift-dur": p.driftDur,
            "--drift-delay": p.driftDelay,
          } as CSSProperties}
        >
          T3
        </span>
      ))}
    </div>
  );
}
