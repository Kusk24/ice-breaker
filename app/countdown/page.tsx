"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { siteText } from "@/lib/content";

const TOTAL_SECONDS = 30; // TODO: change back to 10 * 60 (10 minutes)
const STORAGE_KEY = "bomb-countdown-start";

const stars = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 19) % 100,
  y: (i * 31) % 90,
  delay: `${(i % 6) * 0.55}s`,
}));

const EXPLOSION_PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  angle: `${(i / 32) * 360}deg`,
  dist: `${80 + ((i * 137) % 200)}px`,
  size: `${8 + ((i * 53) % 18)}px`,
  dur: `${0.5 + ((i * 37) % 80) / 100}s`,
}));

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CountdownPage() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDay = localStorage.getItem(STORAGE_KEY + "-day");
    let startTime = Number(localStorage.getItem(STORAGE_KEY));

    if (!startTime || storedDay !== today) {
      startTime = Date.now();
      localStorage.setItem(STORAGE_KEY, String(startTime));
      localStorage.setItem(STORAGE_KEY + "-day", today);
    }

    function tick() {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(TOTAL_SECONDS - elapsed, 0);
      setRemaining(left);
      if (left <= 0) {
        setDone(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) tick();
    }
    window.addEventListener("storage", onStorage);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleGo = useCallback(() => {
    if (!done) return;
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => router.push("/question"));
    } else {
      router.push("/question");
    }
  }, [done, router]);

  const progress = 1 - remaining / TOTAL_SECONDS; // 0 → 1
  const isWarning = remaining <= 120 && remaining > 60; // 2min–1min: building tension
  const isUrgent = remaining <= 60;                     // 1min: danger
  const isAlmostDone = remaining <= 10;                  // 10s: extreme

  // Spark position along cubic bezier: M 50,58 C 56,34 72,12 90,4
  // t=1 (progress=0) → spark at tip (90,4); t=0 (progress=1) → spark at cap (50,58)
  const fuseT = 1 - progress;
  const t = fuseT;
  const sparkX = (1-t)*(1-t)*(1-t)*50 + 3*(1-t)*(1-t)*t*56 + 3*(1-t)*t*t*72 + t*t*t*90;
  const sparkY = (1-t)*(1-t)*(1-t)*58 + 3*(1-t)*(1-t)*t*34 + 3*(1-t)*t*t*12 + t*t*t*4;

  return (
    <main className="scene countdown-scene" aria-label="Countdown timer">
      {/* Stars */}
      <div className="sky" aria-hidden>
        {stars.map((star, i) => (
          <span
            key={`star-cd-${i}`}
            className="star"
            style={{ "--x": star.x, "--y": star.y, "--delay": star.delay } as CSSProperties}
          />
        ))}
      </div>

      {/* Title */}
      <p className={`countdown-title ${done ? "countdown-title--done" : ""}`}>
        {done ? siteText.countdownReady : siteText.countdownTitle}
      </p>

      {/* Bomb */}
      <div className={`bomb-wrap ${done ? "bomb-wrap--exploded" : ""} ${isWarning ? "bomb-wrap--warning" : ""} ${isUrgent ? "bomb-wrap--urgent" : ""} ${isAlmostDone ? "bomb-wrap--shake" : ""}`}>

        {/* Cap + Fuse — cap sits at bottom of SVG on top of bomb sphere, fuse curls up-right */}
        <svg className="bomb-cap-svg" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" aria-hidden overflow="visible">
          <defs>
            {/* Metallic cap body gradient */}
            <linearGradient id="capBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#72728a"/>
              <stop offset="25%"  stopColor="#52526a"/>
              <stop offset="65%"  stopColor="#2c2c3c"/>
              <stop offset="100%" stopColor="#16161e"/>
            </linearGradient>
            <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="1"/>
              <stop offset="30%"  stopColor="#ffea00" stopOpacity="0.9"/>
              <stop offset="70%"  stopColor="#ff6600" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#ff2200" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* ── Fuse rope — goes from cap center upward and curls right to tip ── */}
          {/* shadow */}
          <path d="M 50,57 C 56,34 72,12 90,4" stroke="#1a0c02" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.45"/>
          {/* main rope */}
          <path
            className="fuse-rope"
            d="M 50,57 C 56,34 72,12 90,4"
            stroke="#c8864a"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="84"
            strokeDashoffset={`${progress * 84}`}
          />
          {/* braid texture */}
          <path
            d="M 50,57 C 56,34 72,12 90,4"
            stroke="#7a4e1a"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5 9"
            opacity="0.65"
            strokeDashoffset={`${progress * 84}`}
          />
          {/* highlight stripe */}
          <path
            d="M 50,57 C 56,34 72,12 90,4"
            stroke="#ffe0a0"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="84"
            strokeDashoffset={`${progress * 84}`}
            opacity="0.4"
          />

          {/* ── CAP — simple cute nub on top of bomb ── */}
          <rect x="33" y="57" width="34" height="22" rx="5" fill="url(#capBodyGrad)" stroke="#0e0e1c" strokeWidth="2"/>
          {/* top highlight */}
          <rect x="37" y="59" width="26" height="4" rx="2" fill="rgba(255,255,255,0.22)"/>
          {/* left edge shine */}
          <rect x="36" y="59" width="5" height="17" rx="2" fill="rgba(255,255,255,0.07)"/>
          {/* bottom merge shadow */}
          <rect x="33" y="73" width="34" height="6" rx="3" fill="rgba(0,0,0,0.45)"/>

          {/* ── Spark — proper starburst like reference ── */}
          {!done && (
            <g transform={`translate(${sparkX}, ${sparkY})`}>
              {/* outer glow halo */}
              <circle r="12" fill="url(#sparkGlow)" className="spark-halo"/>
              {/* outer red star */}
              <path
                d="M 0,-7 L 1.7,-2.2 L 6.3,-3.4 L 2.9,0.6 L 5.7,5.2 L 1.1,2.3 L -1.4,6.3 L -2.3,1.5 L -7.2,-0.6 L -2.9,-2.3 Z"
                fill="#ff4500"
                className="spark-star-outer"
              />
              {/* inner yellow star */}
              <path
                d="M 0,-4.2 L 1.0,-1.4 L 4.0,-2.0 L 1.7,0.4 L 3.5,3.1 L 0.6,1.4 L -0.8,3.8 L -1.4,0.9 L -4.3,-0.3 L -1.7,-1.4 Z"
                fill="#ffea00"
                className="spark-star-inner"
              />
              {/* white core */}
              <circle r="1.8" fill="#ffffff" className="spark-core-svg"/>
              {/* floating sparkle dots */}
              <circle r="1.4" fill="#ffe066" className="sparkle s1"/>
              <circle r="1.0" fill="#ffcc00" className="sparkle s2"/>
              <circle r="1.6" fill="#ff9900" className="sparkle s3"/>
              <circle r="0.9" fill="#ffffff" className="sparkle s4"/>
              <circle r="1.2" fill="#ffdd55" className="sparkle s5"/>
              <circle r="1.1" fill="#ffaa30" className="sparkle s6"/>
            </g>
          )}
        </svg>

        {/* Bomb body */}
        <div className="bomb-body">
          <div className="bomb-body__shine" aria-hidden />
          <div className="bomb-body__shine bomb-body__shine--small" aria-hidden />
          <div className="bomb-timer">
            <span className={`bomb-timer__digits ${isUrgent ? "bomb-timer__digits--urgent" : ""}`}>
              {formatTime(remaining)}
            </span>
          </div>
        </div>

        {/* Explosion */}
        {done && (
          <div className="bomb-explosion" aria-hidden>
            {EXPLOSION_PARTICLES.map((p, i) => (
              <span
                key={`boom-${i}`}
                className="bomb-explosion__particle"
                style={{
                  "--angle": p.angle,
                  "--dist": p.dist,
                  "--size": p.size,
                  "--dur": p.dur,
                } as CSSProperties}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="countdown-bar" aria-hidden>
        <div className="countdown-bar__fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* CTA Button — only shown when countdown is done */}
      {done && (
        <button
          type="button"
          className="countdown-btn countdown-btn--active"
          onClick={handleGo}
          aria-label="Proceed to questions"
        >
          {siteText.countdownButton}
        </button>
      )}
    </main>
  );
}
