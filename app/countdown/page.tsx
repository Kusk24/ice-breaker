"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { siteText } from "@/lib/content";
import T3Nebula from "@/app/components/T3Nebula";

const isProd = process.env.NODE_ENV === "production";
const rocketSrc = `${isProd ? "/ice-breaker" : ""}/rocket.svg`;
const thaethuSrc = `${isProd ? "/ice-breaker" : ""}/thaethu.png`;
const iwannabeyoursSrc = `${isProd ? "/ice-breaker" : ""}/iwannabeyours.jpg`;

const TOTAL_SECONDS = 90; // TODO: change back to 10 * 60 (10 minutes)
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
  const [zoomedPiece, setZoomedPiece] = useState<number | null>(null);

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
  const isWarning = remaining <= 70 && remaining > 35;
  const isUrgent = remaining <= 35;
  const isAlmostDone = remaining <= 10;

  // Spark position along cubic bezier: M 50,57 C 56,34 72,12 90,4
  const fuseT = 1 - progress;
  const t = fuseT;
  const sparkX = (1-t)*(1-t)*(1-t)*50 + 3*(1-t)*(1-t)*t*56 + 3*(1-t)*t*t*72 + t*t*t*90;
  const sparkY = (1-t)*(1-t)*(1-t)*57 + 3*(1-t)*(1-t)*t*34 + 3*(1-t)*t*t*12 + t*t*t*4;

  return (
    <main className="scene countdown-scene" aria-label="Countdown timer" onClick={() => zoomedPiece !== null && setZoomedPiece(null)}>
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

      {/* Bomb + Asteroid — shared positioning context */}
      <div className="bomb-stage">

        {/* Asteroid — behind bomb, shatters on explosion, pieces float after */}
        <div className={`asteroid-wrap${exploding ? " asteroid-wrap--explode" : ""}${done ? " asteroid-wrap--done" : ""}`} aria-hidden={!done}>
          {/* Shared defs */}
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              {/* Grey rock body — distinct from the black bomb */}
              <radialGradient id="ast-body" cx="35%" cy="28%" r="68%">
                <stop offset="0%"   stopColor="#c8c8c8"/>
                <stop offset="30%"  stopColor="#909090"/>
                <stop offset="65%"  stopColor="#585858"/>
                <stop offset="100%" stopColor="#282828"/>
              </radialGradient>
              {/* Bottom-right shadow */}
              <radialGradient id="ast-shade" cx="68%" cy="74%" r="52%">
                <stop offset="0%"   stopColor="#111111" stopOpacity="0.75"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
              {/* Crater bowl — darker grey cavity */}
              <radialGradient id="cr-bowl" cx="40%" cy="35%" r="60%">
                <stop offset="0%"   stopColor="#686868"/>
                <stop offset="100%" stopColor="#1e1e1e"/>
              </radialGradient>
              {/* Per-piece rock body outlines — each is its own unique shape */}
              {/* Piece 0 — chunky wedge with bumpy top */}
              <clipPath id="ast-clip-0">
                <path d="M 30,15 C 55,5 95,8 130,12 C 148,18 160,35 155,58 C 150,78 158,100 145,120 C 130,140 105,148 78,145 C 50,142 28,128 18,105 C 8,82 10,52 15,35 C 20,22 25,17 30,15 Z"/>
              </clipPath>
              {/* Piece 1 — wider flat-ish slab */}
              <clipPath id="ast-clip-1">
                <path d="M 25,20 C 58,8 100,12 140,15 C 158,22 168,42 162,65 C 155,88 148,108 135,125 C 115,140 85,145 55,138 C 32,130 15,110 12,85 C 10,60 15,35 25,20 Z"/>
              </clipPath>
              {/* Piece 2 — taller rough chunk */}
              <clipPath id="ast-clip-2">
                <path d="M 35,12 C 60,5 95,10 120,18 C 140,28 152,52 148,80 C 144,108 140,132 125,150 C 105,162 75,165 50,155 C 28,142 15,118 12,90 C 10,62 18,32 35,12 Z"/>
              </clipPath>
              {/* Piece 3 — angular pointed chunk */}
              <clipPath id="ast-clip-3">
                <path d="M 40,10 C 68,5 105,15 130,25 C 150,38 158,62 150,90 C 142,115 128,135 108,148 C 82,155 55,148 35,132 C 18,112 10,85 15,58 C 20,35 28,18 40,10 Z"/>
              </clipPath>
            </defs>
          </svg>

          {([0, 1, 2, 3] as const).map((i) => {
            const rockShapes = [
              // Piece 0 — chunky wedge
              "M 30,15 C 55,5 95,8 130,12 C 148,18 160,35 155,58 C 150,78 158,100 145,120 C 130,140 105,148 78,145 C 50,142 28,128 18,105 C 8,82 10,52 15,35 C 20,22 25,17 30,15 Z",
              // Piece 1 — wider flat slab
              "M 25,20 C 58,8 100,12 140,15 C 158,22 168,42 162,65 C 155,88 148,108 135,125 C 115,140 85,145 55,138 C 32,130 15,110 12,85 C 10,60 15,35 25,20 Z",
              // Piece 2 — taller rough chunk
              "M 35,12 C 60,5 95,10 120,18 C 140,28 152,52 148,80 C 144,108 140,132 125,150 C 105,162 75,165 50,155 C 28,142 15,118 12,90 C 10,62 18,32 35,12 Z",
              // Piece 3 — angular pointed chunk
              "M 40,10 C 68,5 105,15 130,25 C 150,38 158,62 150,90 C 142,115 128,135 108,148 C 82,155 55,148 35,132 C 18,112 10,85 15,58 C 20,35 28,18 40,10 Z",
            ];
            const craters: Record<number, Array<{cx:number;cy:number;rx:number;ry:number}>> = {
              0: [{cx:70,cy:55,rx:22,ry:18},{cx:115,cy:95,rx:14,ry:12},{cx:48,cy:110,rx:10,ry:9}],
              1: [{cx:85,cy:50,rx:24,ry:20},{cx:55,cy:95,rx:16,ry:13},{cx:125,cy:85,rx:11,ry:10}],
              2: [{cx:75,cy:60,rx:20,ry:16},{cx:100,cy:110,rx:18,ry:15},{cx:45,cy:125,rx:12,ry:10}],
              3: [{cx:80,cy:55,rx:22,ry:18},{cx:110,cy:100,rx:15,ry:13},{cx:50,cy:105,rx:11,ry:9}],
            };
            const dots: Record<number, Array<{cx:number;cy:number;r:number}>> = {
              0: [{cx:50,cy:30,r:3},{cx:130,cy:40,r:2.5},{cx:35,cy:85,r:2},{cx:110,cy:125,r:2.5}],
              1: [{cx:45,cy:35,r:2.5},{cx:130,cy:55,r:3},{cx:70,cy:120,r:2},{cx:110,cy:110,r:2.5}],
              2: [{cx:55,cy:30,r:2.5},{cx:110,cy:45,r:2},{cx:35,cy:95,r:3},{cx:95,cy:140,r:2}],
              3: [{cx:65,cy:28,r:2.5},{cx:120,cy:50,r:2},{cx:40,cy:80,r:3},{cx:95,cy:130,r:2}],
            };
            const highlights = [
              "M 30,20 Q 70,10 120,15 Q 140,18 150,30",
              "M 28,25 Q 75,12 125,18 Q 150,25 160,38",
              "M 38,18 Q 72,10 105,15 Q 130,22 145,35",
              "M 42,15 Q 78,10 110,18 Q 135,28 148,42",
            ];
            return (
            <div
              key={i}
              className={`asteroid-piece asteroid-piece--${i}${done ? " asteroid-piece--floating" : ""}${zoomedPiece === i ? " asteroid-piece--zoomed" : ""}`}
              onClick={done ? (e) => { e.stopPropagation(); setZoomedPiece(zoomedPiece === i ? null : i); } : undefined}
              style={done ? { cursor: "pointer" } : undefined}
            >
              <svg viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg" className="asteroid-svg">
                <g clipPath={`url(#ast-clip-${i})`}>
                    {/* Rock body */}
                    <path d={rockShapes[i]} fill="url(#ast-body)" stroke="#2a2a2a" strokeWidth="5" strokeLinejoin="round"/>
                    <path d={rockShapes[i]} fill="url(#ast-shade)" stroke="none"/>

                    {/* Craters */}
                    {craters[i].map((c, ci) => (
                      <g key={ci}>
                        <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="#383838" stroke="#222" strokeWidth="2"/>
                        <ellipse cx={c.cx} cy={c.cy+2} rx={c.rx*0.75} ry={c.ry*0.75} fill="url(#cr-bowl)"/>
                        <ellipse cx={c.cx-2} cy={c.cy-1} rx={c.rx*0.3} ry={c.ry*0.3} fill="#888" opacity="0.45"/>
                      </g>
                    ))}

                    {/* Pockmarks */}
                    {dots[i].map((d, di) => (
                      <circle key={di} cx={d.cx} cy={d.cy} r={d.r} fill="#444"/>
                    ))}

                    {/* Highlight */}
                    <path d={highlights[i]} fill="none" stroke="rgba(200,200,200,0.22)" strokeWidth="6" strokeLinecap="round"/>

                    {/* Image + text on piece 0 (top-left) */}
                    {done && i === 0 && (
                      <image href={thaethuSrc} x="35" y="10" width="100" height="90" preserveAspectRatio="xMidYMid meet" className="asteroid-piece__img-svg"/>
                    )}
                    {zoomedPiece === 0 && i === 0 && (
                      <foreignObject x="30" y="105" width="115" height="30" className="asteroid-piece__text-fo">
                        <p className="asteroid-piece__text asteroid-piece__text--label">{siteText.asteroidTextTopRight}</p>
                      </foreignObject>
                    )}
                    {/* Image on piece 1 (top-right) */}
                    {done && i === 1 && (
                      <image href={iwannabeyoursSrc} x="25" y="20" width="120" height="115" preserveAspectRatio="xMidYMid meet" className="asteroid-piece__img-svg"/>
                    )}
                    {/* Text on piece 2 — centered */}
                    {zoomedPiece === 2 && i === 2 && (
                      <foreignObject x="10" y="10" width="150" height="155" className="asteroid-piece__text-fo">
                        <p className="asteroid-piece__text">{siteText.asteroidTextLeft}</p>
                      </foreignObject>
                    )}
                    {/* Text on piece 3 — centered */}
                    {zoomedPiece === 3 && i === 3 && (
                      <foreignObject x="10" y="10" width="145" height="145" className="asteroid-piece__text-fo">
                        <p className="asteroid-piece__text">{siteText.asteroidTextRight}</p>
                      </foreignObject>
                    )}
                  </g>
                </svg>
              </div>
            );
          })}
          </div>

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
        </div>{/* /bomb-wrap */}
      </div>{/* /bomb-stage */}

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
