"use client";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";

const ENERGY_KEY = "t3-rocket-energy";
const STARS_KEY = "t3-stars-collected";
const TOTAL_STARS = 12;

export default function RocketEnergy({ rocketDelay }: { rocketDelay: string }) {
  const [hasEnergy, setHasEnergy] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(ENERGY_KEY) === "1";
  });
  const [collectedCount, setCollectedCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      return JSON.parse(sessionStorage.getItem(STARS_KEY) || "[]").length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    function sync() {
      const stored = sessionStorage.getItem(ENERGY_KEY) === "1";
      setHasEnergy(stored);
      try {
        setCollectedCount(JSON.parse(sessionStorage.getItem(STARS_KEY) || "[]").length);
      } catch { /* ignore */ }
    }

    window.addEventListener("focus", sync);
    window.addEventListener("t3-refuel", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("t3-refuel", sync);
    };
  }, []);

  const progress = collectedCount / TOTAL_STARS;

  return (
    <div
      className={`rocket-energy-locator ${hasEnergy ? "rocket-energy-locator--full" : ""}`}
      style={{ "--rocket-delay": rocketDelay } as CSSProperties}
    >
      <div className="rocket-energy-locator__ring">
        <svg viewBox="0 0 36 36" className="rocket-energy-locator__svg">
          <circle cx="18" cy="18" r="15.5" className="rocket-energy-locator__track-bg" />
          <circle
            cx="18" cy="18" r="15.5"
            className="rocket-energy-locator__track-fill"
            strokeDasharray={`${progress * 97.4} ${97.4 - progress * 97.4}`}
            strokeDashoffset="24.35"
          />
        </svg>
        <span className="rocket-energy-locator__icon">&#9889;</span>
      </div>
      <span className="rocket-energy-locator__label">
        {hasEnergy ? "READY" : `${collectedCount}/${TOTAL_STARS}`}
      </span>
    </div>
  );
}
