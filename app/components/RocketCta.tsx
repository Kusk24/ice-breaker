"use client";
import { useRouter } from "next/navigation";

export default function RocketCta({ className, label }: { className?: string; label: string }) {
  const router = useRouter();

  function navigate() {
    sessionStorage.setItem("t3-rocket-incoming", "1");
    // Clear fuel so next visit requires finding it again from Gemini
    sessionStorage.removeItem("t3-rocket-fuel");
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => router.push("/countdown"));
    } else {
      router.push("/countdown");
    }
  }

  function handleClick() {
    const rocketElMaybe = document.querySelector<HTMLElement>(".rocket-flight");
    const moonWrapMaybe = document.querySelector<HTMLElement>(".moon-wrap--journey");
    if (!rocketElMaybe || !moonWrapMaybe) { navigate(); return; }
    const rocketEl = rocketElMaybe;
    const moonWrap = moonWrapMaybe;

    const rRect = rocketEl.getBoundingClientRect();
    const mRect = moonWrap.getBoundingClientRect();

    const moonCX = mRect.left + mRect.width / 2;
    const moonCY = mRect.top + mRect.height / 2;
    const rocketCX = rRect.left + rRect.width / 2;
    const rocketCY = rRect.top + rRect.height / 2;
    const rW = rRect.width;
    const rH = rRect.height;

    // Move rocket to body — escapes scene's contain:paint layout
    rocketEl.style.animation = "none";
    rocketEl.style.opacity = "1";
    rocketEl.style.pointerEvents = "none";
    document.body.appendChild(rocketEl);
    rocketEl.style.position = "fixed";
    rocketEl.style.margin = "0";
    rocketEl.style.zIndex = "1000";
    rocketEl.style.left = `${rocketCX - rW / 2}px`;
    rocketEl.style.top  = `${rocketCY - rH / 2}px`;
    rocketEl.style.width  = `${rW}px`;
    rocketEl.style.height = `${rH}px`;

    const dx = rocketCX - moonCX;
    const dy = rocketCY - moonCY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const startAngle = Math.atan2(dy, dx);

    const ORBIT_MS = 1800;
    const LOOPS = 1.5;
    let startTime: number | null = null;

    function orbitFrame(ts: number) {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / ORBIT_MS, 1);
      const eased = t * t;

      const angle = startAngle + LOOPS * 2 * Math.PI * eased;
      const x = moonCX + Math.cos(angle) * radius;
      const y = moonCY + Math.sin(angle) * radius;
      const rot = angle * (180 / Math.PI) + 90;

      rocketEl.style.left = `${x - rW / 2}px`;
      rocketEl.style.top  = `${y - rH / 2}px`;
      rocketEl.style.transform = `rotate(${rot}deg)`;

      if (t < 1) {
        requestAnimationFrame(orbitFrame);
      } else {
        // Orbit done — two-phase exit:
        //   Phase 1 (0-2s):  Moon + stars drift down together (camera follows rocket up)
        //   Phase 2 (2s+):   Rocket punches it — stars stretch into lightspeed lines

        rocketEl.style.transition = "none";
        rocketEl.style.transform = "rotate(-90deg)";

        const sky = document.querySelector<HTMLElement>(".moon-scene .sky");
        const scene = document.querySelector<HTMLElement>(".moon-scene");

        // Lift overflow clipping so stars above viewport are visible
        scene?.classList.add("scene--exiting");

        // Seed extra stars above viewport so sky doesn't go blank during drift.
        // Stars use inline CSS custom properties (--y) for vertical position.
        // We clone each star and shift its --y upward so they fill the gap.
        if (sky) {
          const existing = sky.querySelectorAll<HTMLElement>(".star");
          existing.forEach((s) => {
            // Read the inline --y value from the style attribute
            const yStr = s.style.getPropertyValue("--y");
            const origY = parseFloat(yStr || "30");
            // Create two layers of clones above the viewport
            for (const offset of [-70, -140]) {
              const clone = s.cloneNode(true) as HTMLElement;
              clone.style.setProperty("--y", String(origY + offset));
              sky.appendChild(clone);
            }
          });
        }

        // Phase 1: everything drifts down — moon implodes, text dissolves
        moonWrap.classList.add("moon-implode");
        document.querySelector<HTMLElement>(".moon-text")?.classList.add("text-dissolve");
        document.querySelector<HTMLElement>(".moon-scene .mist")?.classList.add("mist-out");

        const TOTAL_DUR = 3000;
        const WARP_AT = 0.35; // warp stars kick in at 35% through
        const launchStart = performance.now();
        const startTop = parseFloat(rocketEl.style.top);
        let warpTriggered = false;

        function launchFrame(ts: number) {
          const elapsed = ts - launchStart;
          const p = Math.min(elapsed / TOTAL_DUR, 1);

          // Single smooth exponential curve: (e^(4p) - 1) / (e^4 - 1)
          // Starts almost imperceptibly slow, smoothly builds, ends fast
          const e = (Math.exp(4 * p) - 1) / (Math.E * Math.E * Math.E * Math.E - 1);

          // Scene drifts down with same curve (capped at 40vh)
          if (scene) scene.style.transform = `translateY(${Math.min(e * 60, 40)}vh)`;

          // Warp stars trigger partway through
          if (!warpTriggered && p >= WARP_AT) {
            warpTriggered = true;
            sky?.classList.add("warp-speed");
          }

          // Rocket follows same curve — one smooth acceleration
          const ny = startTop - e * (window.innerHeight + 500);
          const bright = 1 + e * 4;

          rocketEl.style.top = `${ny}px`;
          rocketEl.style.filter = `brightness(${bright})`;

          if (p < 1) {
            requestAnimationFrame(launchFrame);
          } else {
            rocketEl.remove();
          }
        }
        requestAnimationFrame(launchFrame);

        setTimeout(navigate, TOTAL_DUR + 400);
      }
    }

    requestAnimationFrame(orbitFrame);
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label}
    </button>
  );
}
