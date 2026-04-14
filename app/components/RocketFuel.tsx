"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";

const ENERGY_KEY = "t3-rocket-energy";
const FADE_DELAY = 4; // seconds after rocket lands before energy dies

interface RocketFuelProps {
  rocketDelay: string;
  children: ReactNode;
}

export default function RocketFuel({ rocketDelay, children }: RocketFuelProps) {
  const [hasEnergy, setHasEnergy] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(ENERGY_KEY) === "1";
  });
  const [energyState, setEnergyState] = useState<"full" | "dying" | "empty">("full");
  const [showAlert, setShowAlert] = useState(false);
  const ctaRef = useRef<HTMLElement | null>(null);

  const landMs = parseFloat(rocketDelay) * 1000 + 3000;

  // Find and track the CTA element
  useEffect(() => {
    const findCta = () => document.querySelector<HTMLElement>(".rocket-flight__cta");

    const poll = setInterval(() => {
      const el = findCta();
      if (el) {
        ctaRef.current = el;
        clearInterval(poll);
        applyCtaStyle(el, hasEnergy);
      }
    }, 200);

    return () => clearInterval(poll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply/remove disabled style whenever hasEnergy changes
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    applyCtaStyle(el, hasEnergy);
  }, [hasEnergy]);

  // Energy dying animation (visual only — flames sputter)
  useEffect(() => {
    if (hasEnergy) return;

    const dyingTimer = setTimeout(() => setEnergyState("dying"), landMs + FADE_DELAY * 1000);
    const emptyTimer = setTimeout(() => setEnergyState("empty"), landMs + FADE_DELAY * 1000 + 2500);

    return () => {
      clearTimeout(dyingTimer);
      clearTimeout(emptyTimer);
    };
  }, [landMs, hasEnergy]);

  // Block ALL clicks on CTA unless hasEnergy is true
  useEffect(() => {
    function intercept(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".rocket-flight__cta")) return;

      if (!hasEnergy) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (energyState === "empty") {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    }

    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [hasEnergy, energyState]);

  // Listen for refuel event (dispatched from constellation page)
  useEffect(() => {
    function onRefuel() {
      sessionStorage.setItem(ENERGY_KEY, "1");
      setHasEnergy(true);
      setEnergyState("full");
    }

    window.addEventListener("t3-refuel", onRefuel);
    return () => window.removeEventListener("t3-refuel", onRefuel);
  }, []);

  // Sync energy on focus (user returns from constellation)
  useEffect(() => {
    function syncEnergy() {
      const stored = sessionStorage.getItem(ENERGY_KEY) === "1";
      if (stored && !hasEnergy) {
        setHasEnergy(true);
        setEnergyState("full");
      }
    }

    window.addEventListener("focus", syncEnergy);
    syncEnergy();

    return () => window.removeEventListener("focus", syncEnergy);
  }, [hasEnergy]);

  const handleAlertDismiss = useCallback(() => setShowAlert(false), []);

  const wrapClass = [
    "rocket-fuel-wrap",
    !hasEnergy && energyState === "dying" && "rocket-fuel-wrap--dying",
    !hasEnergy && energyState === "empty" && "rocket-fuel-wrap--empty",
  ].filter(Boolean).join(" ");

  return (
    <div className={wrapClass}>
      {children}

      {showAlert && (
        <div className="fuel-alert" onClick={handleAlertDismiss}>
          <span className="fuel-alert__text">
            The rocket needs energy! Find energy source to ride ➡🌌
          </span>
        </div>
      )}
    </div>
  );
}

/** Directly apply/remove disabled styling on the CTA element */
function applyCtaStyle(el: HTMLElement, hasEnergy: boolean) {
  if (hasEnergy) {
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
