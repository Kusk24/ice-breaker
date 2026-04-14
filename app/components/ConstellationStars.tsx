"use client";
import { useState, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";

const ENERGY_KEY = "t3-rocket-energy";
const STARS_KEY = "t3-stars-collected";

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

const TOTAL_STARS = geminiStars.length;

const geminiLines = [
  "M 28,18 L 35,20 L 44,24 L 54,28 L 60,27",
  "M 28,18 L 25,28 L 27,36 L 37,42 L 43,46 L 55,52",
  "M 54,28 L 56,42 L 55,52 L 50,62",
];

export default function ConstellationStars() {
  const [collected, setCollected] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem(STARS_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [justCollected, setJustCollected] = useState<number | null>(null);
  const [energyFull, setEnergyFull] = useState(false);

  // Check if energy already full on mount
  useEffect(() => {
    if (sessionStorage.getItem(ENERGY_KEY) === "1") {
      setEnergyFull(true);
    }
  }, []);

  const handleStarClick = useCallback(
    (index: number) => {
      if (collected.includes(index) || energyFull) return;

      setJustCollected(index);
      setTimeout(() => setJustCollected(null), 800);

      const next = [...collected, index];
      setCollected(next);
      sessionStorage.setItem(STARS_KEY, JSON.stringify(next));

      if (next.length >= TOTAL_STARS) {
        setTimeout(() => {
          sessionStorage.setItem(ENERGY_KEY, "1");
          setEnergyFull(true);
          window.dispatchEvent(new Event("t3-refuel"));
        }, 600);
      }
    },
    [collected, energyFull]
  );

  const progress = collected.length / TOTAL_STARS;

  return (
    <>
      {/* Interactive Gemini constellation SVG */}
      <svg
        className="constellation-main constellation-main--interactive"
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
          <filter id="c-glow-collect" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Constellation lines */}
        {geminiLines.map((d, i) => (
          <g key={`line-${i}`}>
            <path
              d={d}
              className="constellation-main__line constellation-main__line--glow"
              style={{ "--li": i } as CSSProperties}
              pathLength={1}
              filter="url(#c-glow-line)"
            />
            <path
              d={d}
              className="constellation-main__line"
              style={{ "--li": i } as CSSProperties}
              pathLength={1}
            />
          </g>
        ))}

        {/* Star nodes — clickable */}
        {geminiStars.map((s, i) => {
          const isCollected = collected.includes(i);
          const isJust = justCollected === i;
          const r = s.size === "lg" ? { outer: 2.2, mid: 1.1, core: 0.5 } :
                    s.size === "md" ? { outer: 1.6, mid: 0.8, core: 0.38 } :
                                      { outer: 1.2, mid: 0.6, core: 0.28 };

          return (
            <g
              key={`gstar-${i}`}
              className={[
                "constellation-main__star",
                isCollected && "constellation-main__star--collected",
                isJust && "constellation-main__star--collecting",
                !isCollected && !energyFull && "constellation-main__star--clickable",
              ].filter(Boolean).join(" ")}
              style={{ "--si": i } as CSSProperties}
              onClick={() => handleStarClick(i)}
            >
              {/* Hit area (invisible, larger) */}
              <circle cx={s.x} cy={s.y} r={3.5} fill="transparent" />

              {/* Collect flash */}
              {isJust && (
                <circle
                  cx={s.x} cy={s.y} r={4}
                  fill="#fff"
                  filter="url(#c-glow-collect)"
                  className="constellation-star-flash"
                />
              )}

              {/* Outer glow */}
              <circle
                cx={s.x} cy={s.y} r={r.outer}
                fill="#4d94ff"
                filter="url(#c-glow-lg)"
                opacity={isCollected ? 0.1 : 0.6}
              />
              {/* Mid glow */}
              <circle
                cx={s.x} cy={s.y} r={r.mid}
                fill="#8cbfff"
                filter="url(#c-glow-md)"
                opacity={isCollected ? 0.15 : 0.85}
              />
              {/* Core */}
              <circle
                cx={s.x} cy={s.y} r={r.core}
                fill={isCollected ? "#334466" : "#ffffff"}
              />
            </g>
          );
        })}

        {/* Gemini symbol */}
        <g className="constellation-main__symbol" transform="translate(50, 78) scale(0.18)">
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

      {/* Energy Locator */}
      <div className={`energy-locator ${energyFull ? "energy-locator--full" : ""}`}>
        <div className="energy-locator__icon" aria-hidden>&#9889;</div>
        <div className="energy-locator__track">
          {Array.from({ length: TOTAL_STARS }, (_, i) => (
            <div
              key={i}
              className={`energy-locator__segment ${
                i < collected.length ? "energy-locator__segment--lit" : ""
              }`}
            />
          ))}
        </div>
        <span className="energy-locator__label">
          {energyFull ? "FULL" : `${collected.length}/${TOTAL_STARS}`}
        </span>
      </div>

      {/* Energy full message */}
      {energyFull && (
        <div className="energy-full-msg">
          <span className="energy-full-msg__text">
            Energy Charged! Return to the rocket &#128640;
          </span>
        </div>
      )}
    </>
  );
}
