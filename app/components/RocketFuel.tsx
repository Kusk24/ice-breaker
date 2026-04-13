"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";

const FUEL_KEY = "t3-rocket-fuel";
const FADE_DELAY = 4; // seconds after rocket lands before fuel dies

interface RocketFuelProps {
  rocketDelay: string;
  children: ReactNode;
}

export default function RocketFuel({ rocketDelay, children }: RocketFuelProps) {
  const [hasFuel, setHasFuel] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(FUEL_KEY) === "1";
  });
  const [fuelState, setFuelState] = useState<"full" | "dying" | "empty">("full");
  const [showAlert, setShowAlert] = useState(false);
  const ctaRef = useRef<HTMLElement | null>(null);

  const landMs = parseFloat(rocketDelay) * 1000 + 3000;

  // Find and track the CTA element
  useEffect(() => {
    const findCta = () => document.querySelector<HTMLElement>(".rocket-flight__cta");

    // Poll briefly until CTA exists (it appears after rocket-cta-in animation delay)
    const poll = setInterval(() => {
      const el = findCta();
      if (el) {
        ctaRef.current = el;
        clearInterval(poll);
        applyCtaStyle(el, hasFuel);
      }
    }, 200);

    return () => clearInterval(poll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply/remove disabled style whenever hasFuel changes
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    applyCtaStyle(el, hasFuel);
  }, [hasFuel]);

  // Fuel dying animation (visual only — flames sputter)
  useEffect(() => {
    if (hasFuel) return; // skip if already fueled

    const dyingTimer = setTimeout(() => setFuelState("dying"), landMs + FADE_DELAY * 1000);
    const emptyTimer = setTimeout(() => setFuelState("empty"), landMs + FADE_DELAY * 1000 + 2500);

    return () => {
      clearTimeout(dyingTimer);
      clearTimeout(emptyTimer);
    };
  }, [landMs, hasFuel]);

  // Block ALL clicks on CTA unless hasFuel is true
  useEffect(() => {
    function intercept(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".rocket-flight__cta")) return;

      if (!hasFuel) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (fuelState === "empty") {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    }

    // Capture phase on document — fires before React's handler
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [hasFuel, fuelState]);

  // Called by Gemini (or anything) to refuel — exposed via custom event
  useEffect(() => {
    function onRefuel() {
      sessionStorage.setItem(FUEL_KEY, "1");
      setHasFuel(true);
      setFuelState("full");
    }

    window.addEventListener("t3-refuel", onRefuel);
    return () => window.removeEventListener("t3-refuel", onRefuel);
  }, []);

  const handleAlertDismiss = useCallback(() => setShowAlert(false), []);

  const wrapClass = [
    "rocket-fuel-wrap",
    !hasFuel && fuelState === "dying" && "rocket-fuel-wrap--dying",
    !hasFuel && fuelState === "empty" && "rocket-fuel-wrap--empty",
  ].filter(Boolean).join(" ");

  return (
    <div className={wrapClass}>
      {children}

      {showAlert && (
        <div className="fuel-alert" onClick={handleAlertDismiss}>
          <span className="fuel-alert__text">
            The rocket needs fuel! Look around... ✨
          </span>
        </div>
      )}
    </div>
  );
}

/** Directly apply/remove disabled styling on the CTA element */
function applyCtaStyle(el: HTMLElement, hasFuel: boolean) {
  if (hasFuel) {
    el.style.removeProperty("opacity");
    el.style.removeProperty("filter");
    el.style.removeProperty("cursor");
    el.classList.remove("rocket-cta--no-fuel");
  } else {
    el.style.setProperty("opacity", "0.4", "important");
    el.style.setProperty("filter", "grayscale(0.8) brightness(0.7)");
    el.style.setProperty("cursor", "not-allowed");
    el.classList.add("rocket-cta--no-fuel");
  }
}
