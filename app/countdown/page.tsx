"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { siteText } from "@/lib/content";
import T3Nebula from "@/app/components/T3Nebula";

const isProd = process.env.NODE_ENV === "production";
const rocketSrc = `${isProd ? "/ice-breaker" : ""}/rocket.svg`;

const TOTAL_SECONDS = 60; // TODO: change back to 10 * 60 (10 minutes)
const STORAGE_KEY = "bomb-countdown-start";

const stars = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 19) % 100,
  y: (i * 31) % 90,
  delay: `${(i % 6) * 0.55}s`,
}));

const T3_FONTS = [
  "serif", "monospace", "'Georgia', serif", "'Impact', sans-serif",
  "'Courier New', monospace", "'Arial Black', sans-serif",
  "'Times New Roman', serif", "fantasy", "cursive",
];
const T3_COLORS = ["#FFD766", "#FF5A70", "#FF8000", "#EEF6FF", "#c084fc", "#34d399", "#f472b6", "#60a5fa"];

const EXPLOSION_PARTICLES = Array.from({ length: 48 }, (_, i) => ({
  angle: `${(i / 48) * 360}deg`,
  dist: `${Math.min(55 + ((i * 137) % 40), 90)}vmax`,
  fontSize: `${18 + ((i * 53) % 32)}px`,
  dur: `${3.2 + ((i * 37) % 180) / 100}s`,
  delay: `${((i * 23) % 80) / 100}s`,
  font: T3_FONTS[i % T3_FONTS.length],
  color: T3_COLORS[i % T3_COLORS.length],
  initRotate: `${(i * 47) % 360}deg`,
  spin: i % 2 === 0 ? 540 : -540,
}));

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CountdownPage() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [exploding, setExploding] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [rocketIncoming, setRocketIncoming] = useState(false);
  const rocketCraftRef = useRef<HTMLDivElement | null>(null);

  // Step 1: detect if we arrived from moon page
  useEffect(() => {
    if (sessionStorage.getItem("t3-rocket-incoming") === "1") {
      sessionStorage.removeItem("t3-rocket-incoming");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRocketIncoming(true);
    }
  }, []);

  // Step 2: once rocket element is mounted, run smooth rAF animation
  useEffect(() => {
    if (!rocketIncoming) return;
    if (!rocketCraftRef.current) return;
    const el: HTMLDivElement = rocketCraftRef.current;

    const DUR = 3000;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let rafId: number;
    const startTime = performance.now();

    // Cubic bezier path (viewport %):
    // P0 = bottom center, P1/P2 = controls, P3 = off upper-right
    const p0x = 0.44, p0y = 1.15;
    const p1x = 0.45, p1y = 0.30;
    const p2x = 0.55, p2y = 0.10;
    const p3x = 1.20, p3y = -0.05;

    function cubic(t: number, a: number, b: number, c: number, d: number) {
      const u = 1 - t;
      return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
    }

    function frame(ts: number) {
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / DUR, 1);
      const e = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;

      const px = cubic(e, p0x, p1x, p2x, p3x) * vw;
      const py = cubic(e, p0y, p1y, p2y, p3y) * vh;

      // Rotation from curve tangent
      const dt = 0.005;
      const t2 = Math.min(e + dt, 1);
      const tx = cubic(t2, p0x, p1x, p2x, p3x) * vw - px;
      const ty = cubic(t2, p0y, p1y, p2y, p3y) * vh - py;
      const angle = Math.atan2(ty, tx) * (180 / Math.PI);

      const scale = 0.5 + 0.5 * Math.sin(Math.min(t, 0.6) / 0.6 * Math.PI);
      const opacity = t < 0.05 ? t / 0.05 : t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1;

      el.style.left = `${px}px`;
      el.style.top = `${py}px`;
      el.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`;
      el.style.opacity = `${opacity}`;

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        setRocketIncoming(false);
      }
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [rocketIncoming]);

  useEffect(() => {
    // Already exploded — skip bomb entirely, show done state.
    // One-time localStorage read on mount: setState here is intentional.
    if (localStorage.getItem("t3-exploded") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemaining(0);
      setDone(true);
      return;
    }

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
        if (intervalRef.current) clearInterval(intervalRef.current);
        localStorage.setItem("t3-exploded", "1");
        setExploding(true);
        setTimeout(() => setDone(true), 4200);
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
  const isWarning = remaining <= 120 && remaining > 60;
  const isUrgent = remaining <= 60;
  const isAlmostDone = remaining <= 10;

  // Spark position along cubic bezier: M 50,57 C 56,34 72,12 90,4
  const fuseT = 1 - progress;
  const t = fuseT;
  const sparkX = (1-t)*(1-t)*(1-t)*50 + 3*(1-t)*(1-t)*t*56 + 3*(1-t)*t*t*72 + t*t*t*90;
  const sparkY = (1-t)*(1-t)*(1-t)*57 + 3*(1-t)*(1-t)*t*34 + 3*(1-t)*t*t*12 + t*t*t*4;

  return (
    <main className="scene countdown-scene" aria-label="Countdown timer">
      {/* Screen flash on explosion */}
      {exploding && <div className="explosion-flash" aria-hidden />}

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
      <div className={`bomb-wrap ${exploding ? "bomb-wrap--exploded" : ""} ${isWarning ? "bomb-wrap--warning" : ""} ${isUrgent ? "bomb-wrap--urgent" : ""} ${isAlmostDone && !exploding ? "bomb-wrap--shake" : ""}`}>

        {/* Cap + Fuse SVG */}
        {!exploding && !done && (
          <svg className="bomb-cap-svg" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" aria-hidden overflow="visible">
            <defs>
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

            {/* Fuse shadow */}
            <path d="M 50,57 C 56,34 72,12 90,4" stroke="#1a0c02" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.45"/>
            {/* Fuse main rope */}
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

            {/* CAP */}
            <rect x="33" y="57" width="34" height="22" rx="5" fill="url(#capBodyGrad)" stroke="#0e0e1c" strokeWidth="2"/>
            <rect x="37" y="59" width="26" height="4" rx="2" fill="rgba(255,255,255,0.22)"/>
            <rect x="36" y="59" width="5" height="17" rx="2" fill="rgba(255,255,255,0.07)"/>
            <rect x="33" y="73" width="34" height="6" rx="3" fill="rgba(0,0,0,0.45)"/>

            {/* Spark */}
            <g transform={`translate(${sparkX}, ${sparkY})`}>
              <circle r="12" fill="url(#sparkGlow)" className="spark-halo"/>
              <path
                d="M 0,-7 L 1.7,-2.2 L 6.3,-3.4 L 2.9,0.6 L 5.7,5.2 L 1.1,2.3 L -1.4,6.3 L -2.3,1.5 L -7.2,-0.6 L -2.9,-2.3 Z"
                fill="#ff4500"
                className="spark-star-outer"
              />
              <path
                d="M 0,-4.2 L 1.0,-1.4 L 4.0,-2.0 L 1.7,0.4 L 3.5,3.1 L 0.6,1.4 L -0.8,3.8 L -1.4,0.9 L -4.3,-0.3 L -1.7,-1.4 Z"
                fill="#ffea00"
                className="spark-star-inner"
              />
              <circle r="1.8" fill="#ffffff" className="spark-core-svg"/>
              <circle r="1.4" fill="#ffe066" className="sparkle s1"/>
              <circle r="1.0" fill="#ffcc00" className="sparkle s2"/>
              <circle r="1.6" fill="#ff9900" className="sparkle s3"/>
              <circle r="0.9" fill="#ffffff" className="sparkle s4"/>
              <circle r="1.2" fill="#ffdd55" className="sparkle s5"/>
              <circle r="1.1" fill="#ffaa30" className="sparkle s6"/>
            </g>
          </svg>
        )}

        {/* Bomb body */}
        {!exploding && !done && (
          <div className="bomb-body">
            <div className="bomb-body__shine" aria-hidden />
            <div className="bomb-body__shine bomb-body__shine--small" aria-hidden />
            <div className="bomb-timer">
              <span className={`bomb-timer__digits ${isUrgent ? "bomb-timer__digits--urgent" : ""}`}>
                {formatTime(remaining)}
              </span>
            </div>
          </div>
        )}

        {/* T3 Explosion particles */}
        {exploding && (
          <div className="bomb-explosion" aria-hidden>
            {/* Nebula gas clouds — expand from center */}
            <div className="nebula-gas nebula-gas--1" />
            <div className="nebula-gas nebula-gas--2" />
            <div className="nebula-gas nebula-gas--3" />
            <div className="nebula-gas nebula-gas--4" />
            {/* Central burst flash */}
            <div className="bomb-explosion__burst" />
            {EXPLOSION_PARTICLES.map((p, i) => (
              <span
                key={`boom-${i}`}
                className="bomb-explosion__particle"
                style={{
                  "--angle": p.angle,
                  "--dist": p.dist,
                  "--init-rotate": p.initRotate,
                  "--spin": `${p.spin}deg`,
                  fontFamily: p.font,
                  fontSize: p.fontSize,
                  color: p.color,
                  animationDuration: p.dur,
                  animationDelay: p.delay,
                } as CSSProperties}
              >
                T3
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="countdown-bar" aria-hidden>
        <div className="countdown-bar__fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Nebula residue — appears after explosion */}
      {done && <T3Nebula />}

      {/* CTA Button — only shown after explosion animation */}
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

      {/* Rocket flying in from moon page */}
      {rocketIncoming && (
        <>
          <div className="rocket-incoming__flash" aria-hidden />
          <div className="rocket-incoming" aria-hidden>
            <div className="rocket-incoming__craft" ref={rocketCraftRef}>
              <span className="rocket-incoming__trail" />
              <span className="rocket-incoming__flame rocket-incoming__flame--outer" />
              <span className="rocket-incoming__flame rocket-incoming__flame--core" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={rocketSrc} alt="" className="rocket-incoming__image" />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
