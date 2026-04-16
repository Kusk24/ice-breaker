"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";

const ENERGY_KEY = "t3-rocket-energy";
const STARS_KEY = "t3-stars-collected";

/*
 * Star positions match the GeminiConstellation on the moon page
 * (original viewBox 0 0 400 480 → scaled to 0 0 100 100)
 */
const geminiStars: Array<{ x: number; y: number; size: "lg" | "md" | "sm" }> = [
  { x: 27.5,  y: 16.7, size: "lg" },  // 0
  { x: 40,    y: 18.8, size: "md" },  // 1
  { x: 55,    y: 24,   size: "lg" },  // 2
  { x: 70,    y: 29.2, size: "md" },  // 3
  { x: 82.5,  y: 27.1, size: "lg" },  // 4
  { x: 21.25, y: 27.1, size: "md" },  // 5
  { x: 23.75, y: 37.5, size: "md" },  // 6
  { x: 38.75, y: 43.8, size: "md" },  // 7
  { x: 50,    y: 46.9, size: "lg" },  // 8
  { x: 67.5,  y: 52.1, size: "md" },  // 9
  { x: 70.5,  y: 40.6, size: "md" },  // 10
  { x: 60,    y: 64.6, size: "lg" },  // 11
];

const TOTAL_STARS = geminiStars.length;

/* Each segment connects two star indices */
const geminiSegments: Array<[number, number]> = [
  // Top branch: 0→1→2→3→4
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Left branch: 0→5→6→7→8→9
  [0, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  // Right branch: 3→10→9→11
  [3, 10], [10, 9], [9, 11],
];

function getPageZoom() {
  if (typeof window === "undefined") return 1;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--page-zoom").trim();
  const n = parseFloat(v);
  return n > 0 ? n : 1;
}

/** Spawn energy stream particles from star to energy bar */
function spawnEnergyStream(starX: number, starY: number) {
  const bar = document.querySelector(".energy-locator");
  if (!bar) return;

  const z = getPageZoom();
  const barRect = bar.getBoundingClientRect();
  const endX = (barRect.left + barRect.width / 2) / z;
  const endY = (barRect.top + barRect.height * 0.45) / z;

  const PARTICLE_COUNT = 12;
  const STREAM_DURATION = 900;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement("div");
    p.className = "energy-particle";

    // Stagger each particle
    const delay = i * 50;
    const size = 4 + Math.random() * 6;

    p.style.cssText = `
      position: fixed;
      left: ${starX}px;
      top: ${starY}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      background: radial-gradient(circle, #fff 0%, #80c0ff 40%, #4090ff 70%, transparent 100%);
      box-shadow: 0 0 ${size * 2}px ${size}px rgba(80,160,255,0.5),
                  0 0 ${size * 4}px ${size * 1.5}px rgba(60,120,255,0.2);
      opacity: 0;
    `;
    document.body.appendChild(p);

    const dx = endX - starX;
    const dy = endY - starY;
    // Curve offset: perpendicular to the line, randomized
    const perpX = -dy * 0.15 * (Math.random() - 0.3);
    const perpY = dx * 0.15 * (Math.random() - 0.3);

    const startTime = performance.now() + delay;

    function animate(ts: number) {
      const elapsed = ts - startTime;
      if (elapsed < 0) { requestAnimationFrame(animate); return; }

      const t = Math.min(elapsed / STREAM_DURATION, 1);
      // Ease-in-out for smooth flow
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      // Quadratic bezier: start → control(midpoint+perp) → end
      const mt = 1 - ease;
      const cx = (starX + endX) / 2 + perpX;
      const cy = (starY + endY) / 2 + perpY;
      const x = mt * mt * starX + 2 * mt * ease * cx + ease * ease * endX;
      const y = mt * mt * starY + 2 * mt * ease * cy + ease * ease * endY;

      // Fade in fast, hold, fade out at end
      const opacity = t < 0.1 ? t / 0.1 : t > 0.75 ? (1 - t) / 0.25 : 1;
      // Shrink near end
      const scale = t > 0.7 ? 1 - (t - 0.7) / 0.3 * 0.6 : 1;

      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.opacity = String(opacity * 0.9);
      p.style.transform = `translate(-50%, -50%) scale(${scale})`;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        p.remove();
      }
    }
    requestAnimationFrame(animate);
  }
}

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
  const svgRef = useRef<SVGSVGElement>(null);

  // Check if energy already full on mount
  useEffect(() => {
    if (sessionStorage.getItem(ENERGY_KEY) === "1") {
      setEnergyFull(true);
    }
  }, []);

  const handleStarClick = useCallback(
    (index: number) => {
      if (collected.includes(index) || energyFull) return;

      // Get star screen position from SVG
      const svg = svgRef.current;
      if (svg) {
        const star = geminiStars[index];
        const pt = svg.createSVGPoint();
        pt.x = star.x;
        pt.y = star.y;
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const screenPt = pt.matrixTransform(ctm);
          const z = getPageZoom();
          spawnEnergyStream(screenPt.x / z, screenPt.y / z);
        }
      }

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
        }, 1200);
      }
    },
    [collected, energyFull]
  );

  const progress = collected.length / TOTAL_STARS;

  return (
    <>
      {/* Interactive Gemini constellation SVG */}
      <svg
        ref={svgRef}
        className="constellation-main constellation-main--interactive"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glow filters — layered for realistic star look */}
          <filter id="c-bloom" x="-400%" y="-400%" width="900%" height="900%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="c-glow-lg" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id="c-glow-md" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="c-glow-sm" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <filter id="c-glow-line" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
          <filter id="c-glow-collect" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          {/* Radial gradients for natural star glow */}
          <radialGradient id="c-star-glow-lg">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="15%" stopColor="#c8e0ff" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#4d94ff" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#2060cc" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#1040aa" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="c-star-glow-md">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="20%" stopColor="#b0d4ff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#4d94ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1040aa" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="c-star-glow-sm">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#a0c8ff" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#4d94ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1040aa" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Constellation line segments — draw in on load, fade out when collected */}
        {geminiSegments.map(([a, b], i) => {
          const sa = geminiStars[a];
          const sb = geminiStars[b];
          const aCollected = collected.includes(a);
          const bCollected = collected.includes(b);
          // Lines start visible and fade out as stars are collected
          const segOpacity = aCollected && bCollected ? 0 : aCollected || bCollected ? 0.35 : 0.85;
          const delay = `${0.8 + i * 0.12}s`;
          return (
            <g
              key={`seg-${i}`}
              className="constellation-main__seg"
              style={{
                "--seg-d": delay,
                "--seg-o": segOpacity,
                opacity: segOpacity,
                transition: "opacity 0.8s ease",
              } as CSSProperties}
            >
              <line
                x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                className="constellation-main__line constellation-main__line--glow"
                style={{ "--seg-d": delay } as CSSProperties}
                filter="url(#c-glow-line)"
                pathLength={1}
              />
              <line
                x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                className="constellation-main__line"
                style={{ "--seg-d": delay } as CSSProperties}
                pathLength={1}
              />
            </g>
          );
        })}

        {/* Star nodes — clickable */}
        {geminiStars.map((s, i) => {
          const isCollected = collected.includes(i);
          const isJust = justCollected === i;
          const grad = s.size === "lg" ? "url(#c-star-glow-lg)" :
                       s.size === "md" ? "url(#c-star-glow-md)" : "url(#c-star-glow-sm)";
          const r = s.size === "lg" ? { bloom: 14, outer: 8, mid: 5, inner: 2.8, core: 1.4 } :
                                      { bloom: 10, outer: 6, mid: 3.5, inner: 2, core: 1 };

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
              {/* Collect flash */}
              {isJust && (
                <circle
                  cx={s.x} cy={s.y} r={14}
                  fill="#fff"
                  filter="url(#c-glow-collect)"
                  className="constellation-star-flash"
                  pointerEvents="none"
                />
              )}

              {/* Layer 1: Wide bloom — soft atmospheric glow */}
              <circle
                cx={s.x} cy={s.y} r={r.bloom}
                fill={grad}
                filter="url(#c-bloom)"
                opacity={isCollected ? 0.04 : 0.35}
                pointerEvents="none"
              />

              {/* Layer 2: Outer glow */}
              <circle
                cx={s.x} cy={s.y} r={r.outer}
                fill={grad}
                filter="url(#c-glow-lg)"
                opacity={isCollected ? 0.06 : 0.5}
                pointerEvents="none"
              />

              {/* Layer 3: Mid glow — bright ring */}
              <circle
                cx={s.x} cy={s.y} r={r.mid}
                fill="#6aadff"
                filter="url(#c-glow-md)"
                opacity={isCollected ? 0.08 : 0.65}
                pointerEvents="none"
              />

              {/* Layer 4: Inner glow — hot white-blue */}
              <circle
                cx={s.x} cy={s.y} r={r.inner}
                fill="#c0dfff"
                filter="url(#c-glow-sm)"
                opacity={isCollected ? 0.1 : 0.85}
                pointerEvents="none"
              />

              {/* Layer 5: Core — pure white */}
              <circle
                cx={s.x} cy={s.y} r={r.core}
                fill={isCollected ? "#2a3a55" : "#ffffff"}
                pointerEvents="none"
              />

              {/* Hit area — on top, sized to not overlap neighbors */}
              <circle cx={s.x} cy={s.y} r={5.5} fill="transparent" style={{ cursor: "pointer" }} />
            </g>
          );
        })}

        {/* Gemini symbol — tiny inline with title */}
        <g className="constellation-main__symbol" transform="translate(50, 93) scale(0.055)">
          <circle cx="0" cy="0" r="42" fill="none" stroke="#7bb4ff" strokeWidth="2.5" opacity="0.4" />
          <g stroke="#7bb4ff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5">
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
