"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";

const BUTTERFLIES = [
  { id: 0, cx: 33, cy: 42, hue: 320, size: 13, flapSpeed: "0.28s" },
  { id: 1, cx: 58, cy: 38, hue: 270, size: 15, flapSpeed: "0.24s" },
  { id: 2, cx: 45, cy: 60, hue: 195, size: 12, flapSpeed: "0.32s" },
  { id: 3, cx: 28, cy: 58, hue: 340, size: 14, flapSpeed: "0.26s" },
  { id: 4, cx: 65, cy: 55, hue: 250, size: 13, flapSpeed: "0.30s" },
  { id: 5, cx: 50, cy: 46, hue: 170, size: 11, flapSpeed: "0.22s" },
] as const;

const FIREFLIES = [
  { id: 0, cx: 26, cy: 44, size: 5 },
  { id: 1, cx: 50, cy: 34, size: 4 },
  { id: 2, cx: 68, cy: 50, size: 6 },
  { id: 3, cx: 36, cy: 64, size: 4.5 },
  { id: 4, cx: 60, cy: 66, size: 5 },
  { id: 5, cx: 74, cy: 56, size: 4 },
  { id: 6, cx: 22, cy: 60, size: 5.5 },
  { id: 7, cx: 54, cy: 54, size: 4 },
] as const;

function getPageZoom() {
  if (typeof window === "undefined") return 1;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--page-zoom").trim();
  const n = parseFloat(v);
  return n > 0 ? n : 1;
}

function getButtonCenter() {
  const z = getPageZoom();
  const btn = document.querySelector<HTMLElement>(".hero__btn--cage-reveal");
  if (btn) {
    const r = btn.getBoundingClientRect();
    return { x: (r.left + r.width / 2) / z, y: (r.top + r.height / 2) / z };
  }
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return { x: window.innerWidth / z / 2, y: (window.innerHeight / z) * 0.12 + 13.5 * rem };
}

export default function CageRelease({ onRelease }: { onRelease: () => void }) {
  const [phase, setPhase] = useState<"hidden" | "idle" | "open" | "orbiting">("hidden");
  const cageRef = useRef<HTMLDivElement>(null);
  const bfRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ffRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase("idle"), 11000);
    return () => clearTimeout(t);
  }, []);

  const handleClick = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("open");

    const cage = cageRef.current;
    if (!cage) return;
    const z = getPageZoom();
    const rawRect = cage.getBoundingClientRect();
    const rect = {
      left: rawRect.left / z,
      top: rawRect.top / z,
      width: rawRect.width / z,
      height: rawRect.height / z,
    };
    const target = getButtonCenter();

    const allRefs = [
      ...bfRefs.current.map((el, i) => ({
        el,
        sx: rect.left + (BUTTERFLIES[i].cx / 100) * rect.width,
        sy: rect.top  + (BUTTERFLIES[i].cy / 100) * rect.height,
        orbitIdx: i,
        total: BUTTERFLIES.length + FIREFLIES.length,
        isButterfly: true,
      })),
      ...ffRefs.current.map((el, i) => ({
        el,
        sx: rect.left + (FIREFLIES[i].cx / 100) * rect.width,
        sy: rect.top  + (FIREFLIES[i].cy / 100) * rect.height,
        orbitIdx: BUTTERFLIES.length + i,
        total: BUTTERFLIES.length + FIREFLIES.length,
        isButterfly: false,
      })),
    ];

    // Show all flying creatures at their cage screen position
    allRefs.forEach(({ el, sx, sy }) => {
      if (!el) return;
      el.style.opacity = "1";
      el.style.left = `${sx}px`;
      el.style.top  = `${sy}px`;
      el.style.transition = "none";
    });

    // After cage open flash (400ms), fly creatures to orbit spread positions
    setTimeout(() => {
      allRefs.forEach(({ el, orbitIdx, total, isButterfly }, i) => {
        if (!el) return;
        const angle = (orbitIdx / total) * Math.PI * 2;
        const r = isButterfly ? 70 + (orbitIdx % 3) * 22 : 42 + (orbitIdx % 4) * 14;
        const destX = target.x + Math.cos(angle) * r;
        const destY = target.y + Math.sin(angle) * r * 0.48;
        const delay = i * 120;
        const dur   = 2400 + (i % 5) * 180;
        el.style.transition = `left ${dur}ms cubic-bezier(0.22,0.68,0,1.2) ${delay}ms, top ${dur}ms cubic-bezier(0.22,0.68,0,1.2) ${delay}ms`;
        el.style.left = `${destX}px`;
        el.style.top  = `${destY}px`;
      });

      // When last one lands, switch to orbit + reveal button
      // last index = 13, delay = 13*120=1560, dur up to 2400+4*180=3120 → total 4680
      const flightDone = 13 * 120 + 3120 + 400;
      setTimeout(() => {
        setPhase("orbiting");
        onRelease();
      }, flightDone);
    }, 420);
  }, [phase, onRelease]);

  // Orbit rAF
  useEffect(() => {
    if (phase !== "orbiting") return;
    const total = BUTTERFLIES.length + FIREFLIES.length;
    const start = performance.now();

    function tick(now: number) {
      const t = now - start;
      const center = getButtonCenter();

      bfRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transition = "none";
        const angle = (i / total) * Math.PI * 2 + t * (0.00045 + i * 0.00008);
        const r = 70 + (i % 3) * 22 + Math.sin(t * 0.0008 + i) * 8;
        el.style.left = `${center.x + Math.cos(angle) * r}px`;
        el.style.top  = `${center.y + Math.sin(angle) * r * 0.48}px`;
      });

      ffRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transition = "none";
        const oi = BUTTERFLIES.length + i;
        const angle = (oi / total) * Math.PI * 2 + t * (0.00038 + i * 0.00006);
        const r = 42 + (i % 4) * 14 + Math.sin(t * 0.001 + i * 1.3) * 6;
        el.style.left = `${center.x + Math.cos(angle) * r}px`;
        el.style.top  = `${center.y + Math.sin(angle) * r * 0.5}px`;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const isIdle = phase === "idle";
  const isOpen = phase !== "hidden" && phase !== "idle";
  const showInSvg = phase === "idle";   // draw inside SVG only while caged
  const showFlying = phase !== "hidden"; // flying divs always mounted once cage visible

  return (
    <>
      {/* ── Cage ── */}
      <div
        className={[
          "cage-wrap",
          phase !== "hidden" ? "cage-wrap--visible" : "",
          isOpen ? "cage-wrap--open" : "",
        ].filter(Boolean).join(" ")}
      >
        <div
          ref={cageRef}
          className="cage"
          onClick={isIdle ? handleClick : undefined}
          role={isIdle ? "button" : undefined}
          tabIndex={isIdle ? 0 : undefined}
          aria-label="Open the cage"
          onKeyDown={isIdle
            ? (e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }
            : undefined}
          style={{ cursor: isIdle ? "pointer" : "default" } as CSSProperties}
        >
          <svg className="cage__svg" viewBox="0 0 100 110" aria-hidden>
            {/* Hook ring + chain */}
            <circle cx="50" cy="8" r="4.5" fill="none" stroke="#c9a84c" strokeWidth="1.6" />
            <line x1="50" y1="12.5" x2="50" y2="17" stroke="#c9a84c" strokeWidth="1.5" />

            {/* Dome glow fill */}
            <path d="M 14 78 Q 14 20 50 16 Q 86 20 86 78 Z"
              fill="rgba(255,215,80,0.06)" />

            {/* Dome outline */}
            <path d="M 14 78 Q 14 20 50 16 Q 86 20 86 78"
              fill="none" stroke="#d4ad4e" strokeWidth="2" opacity="0.92" />
            {/* Inner dome highlight */}
            <path d="M 22 78 Q 22 28 50 24 Q 78 28 78 78"
              fill="none" stroke="#f0d070" strokeWidth="0.5" opacity="0.35" />

            {/* Vertical bars */}
            {[26, 36, 44, 56, 64, 74].map((x) => {
              const top = 78 - Math.sqrt(Math.max(0, 1296 - (x - 50) ** 2)) * 1.6;
              return (
                <line key={x} x1={x} y1={78} x2={x} y2={Math.max(20, top)}
                  stroke="#c9a84c" strokeWidth="1.2" opacity="0.55" />
              );
            })}

            {/* Horizontal rings */}
            <ellipse cx="50" cy="40" rx="30" ry="1.8" fill="none" stroke="#c9a84c" strokeWidth="0.9" opacity="0.32" />
            <ellipse cx="50" cy="58" rx="35" ry="2"   fill="none" stroke="#c9a84c" strokeWidth="0.9" opacity="0.32" />

            {/* Base */}
            <ellipse cx="50" cy="78" rx="38" ry="4.5" fill="none" stroke="#d4ad4e" strokeWidth="2.2" opacity="0.88" />
            <ellipse cx="50" cy="80" rx="36" ry="3.5" fill="rgba(60,45,15,0.25)" />

            {/* Door */}
            <rect className="cage__door" x="18" y="50" width="14" height="26" rx="2"
              fill="rgba(255,210,80,0.04)" stroke="#d4ad4e" strokeWidth="1.3" opacity="0.5" />
            <circle cx="29" cy="63" r="1.1" fill="#d4ad4e" opacity="0.55" />

            {/* Top scroll */}
            <path d="M 43 24 Q 46 20 50 24 Q 54 20 57 24"
              fill="none" stroke="#d4ad4e" strokeWidth="0.7" opacity="0.4" />

            {/* ── Creatures drawn inside SVG when caged ── */}
            {showInSvg && BUTTERFLIES.map((b) => (
              <g key={`svg-bf-${b.id}`} transform={`translate(${b.cx},${b.cy})`}>
                {/* Left wing */}
                <ellipse cx="-5" cy="-1" rx="5.5" ry="3.8"
                  fill={`hsla(${b.hue},85%,72%,0.9)`}
                  stroke={`hsla(${b.hue},60%,55%,0.3)`}
                  strokeWidth="0.3"
                  className="bf-wing-l" />
                {/* Right wing */}
                <ellipse cx="5" cy="-1" rx="5.5" ry="3.8"
                  fill={`hsla(${b.hue},85%,72%,0.9)`}
                  stroke={`hsla(${b.hue},60%,55%,0.3)`}
                  strokeWidth="0.3"
                  className="bf-wing-r" />
                {/* Body */}
                <ellipse cx="0" cy="0" rx="1.1" ry="3"
                  fill={`hsla(${b.hue},40%,22%,0.9)`} />
                {/* Soft glow */}
                <circle cx="0" cy="0" r="6"
                  fill={`hsla(${b.hue},80%,78%,0.07)`} />
              </g>
            ))}

            {showInSvg && FIREFLIES.map((f) => (
              <g key={`svg-ff-${f.id}`} transform={`translate(${f.cx},${f.cy})`}>
                <circle r={f.size * 0.55} fill="#fffde8" opacity="0.95" />
                <circle r={f.size}        fill="rgba(255,235,100,0.22)" />
                <circle r={f.size * 1.8}  fill="rgba(255,210,60,0.07)"  />
              </g>
            ))}
          </svg>

          {isIdle && <span className="cage__hint">tap me</span>}
        </div>
      </div>

      {/* ── Flying creatures — always mounted once cage visible, hidden until released ── */}
      {showFlying && BUTTERFLIES.map((b, i) => (
        <div
          key={`fly-bf-${b.id}`}
          ref={(el) => { bfRefs.current[i] = el; }}
          className="fly-butterfly"
          style={{
            "--bhue": b.hue,
            "--bsize": `${b.size}px`,
            "--flap": b.flapSpeed,
            opacity: 0,
            // Start hidden at cage position; JS sets left/top on release
            left: "-200px",
            top: "-200px",
          } as CSSProperties}
          aria-hidden
        >
          <span className="fly-butterfly__wing fly-butterfly__wing--l" />
          <span className="fly-butterfly__wing fly-butterfly__wing--r" />
          <span className="fly-butterfly__body" />
          <span className="fly-butterfly__glow" />
        </div>
      ))}

      {showFlying && FIREFLIES.map((f, i) => (
        <div
          key={`fly-ff-${f.id}`}
          ref={(el) => { ffRefs.current[i] = el; }}
          className="fly-firefly"
          style={{
            "--fsize": `${f.size}px`,
            opacity: 0,
            left: "-200px",
            top: "-200px",
          } as CSSProperties}
          aria-hidden
        />
      ))}
    </>
  );
}
