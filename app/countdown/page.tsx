"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { siteText } from "@/lib/content";

const TOTAL_SECONDS = 15 * 60; // TODO: change back to 10 * 60 (10 minutes)
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
  const isUrgent = remaining <= 60;
  const isAlmostDone = remaining <= 10;

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
      <div className={`bomb-wrap ${done ? "bomb-wrap--exploded" : ""} ${isUrgent ? "bomb-wrap--urgent" : ""} ${isAlmostDone ? "bomb-wrap--shake" : ""}`}>

        {/* Neck cap */}
        <div className="bomb-cap" aria-hidden>
          <div className="bomb-cap__ring" />
          <div className="bomb-cap__tube" />
          {/* Fuse — curved rope with spark, anchored to cap */}
          <div className="bomb-fuse">
            <div className="bomb-fuse__rope" style={{ "--burn": progress } as CSSProperties} />
            {!done && (
              <div className="bomb-fuse__spark">
                <span className="bomb-fuse__spark-star" />
                <span className="bomb-fuse__spark-star bomb-fuse__spark-star--mid" />
                <span className="bomb-fuse__spark-star bomb-fuse__spark-star--inner" />
                <span className="bomb-fuse__spark-core" />
              </div>
            )}
          </div>
        </div>

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

      {/* CTA Button */}
      <button
        type="button"
        className={`countdown-btn ${done ? "countdown-btn--active" : "countdown-btn--locked"}`}
        onClick={handleGo}
        disabled={!done}
        aria-label={done ? "Proceed to questions" : "Wait for countdown"}
      >
        {done ? siteText.countdownButton : `Wait ${formatTime(remaining)}`}
      </button>
    </main>
  );
}
