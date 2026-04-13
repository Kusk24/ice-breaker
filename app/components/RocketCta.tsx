"use client";
import { useRouter } from "next/navigation";

export default function RocketCta({ className, label }: { className?: string; label: string }) {
  const router = useRouter();

  function navigate() {
    sessionStorage.setItem("t3-rocket-incoming", "1");
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
        // Orbit done — rocket flies straight upward
        // The rocket SVG nose points right; after orbit the rotation
        // already has it pointing roughly upward (~270deg from orbit math).
        // Snap to exactly -90deg (nose up) for a clean vertical launch.
        rocketEl.style.transition = "none";
        rocketEl.style.transform = "rotate(-90deg)";

        // Trigger scene exit effects
        moonWrap.classList.add("moon-implode");
        document.querySelector<HTMLElement>(".moon-text")?.classList.add("text-dissolve");
        document.querySelector<HTMLElement>(".moon-scene .sky")?.classList.add("warp-speed");
        document.querySelector<HTMLElement>(".moon-scene .mist")?.classList.add("mist-out");

        // Rocket accelerates upward and off screen
        const launchDur = 1400;
        const launchStart = performance.now();
        const startTop = parseFloat(rocketEl.style.top);

        function launchFrame(ts: number) {
          const p = Math.min((ts - launchStart) / launchDur, 1);
          // Ease-in exponential — slow start then rockets away
          const e = p * p * p;

          const ny = startTop - e * (window.innerHeight + 400);
          const bright = 1 + e * 3;

          rocketEl.style.top = `${ny}px`;
          rocketEl.style.filter = `brightness(${bright})`;

          if (p < 1) {
            requestAnimationFrame(launchFrame);
          } else {
            rocketEl.remove();
          }
        }
        requestAnimationFrame(launchFrame);

        // Wait for warp effect to play out then navigate
        setTimeout(navigate, 2800);
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
