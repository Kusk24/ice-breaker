"use client";
import { useRouter } from "next/navigation";

export default function RocketCta({ className, label }: { className?: string; label: string }) {
  const router = useRouter();

  function navigate() {
    sessionStorage.setItem("t3-rocket-incoming", "1");
    // Clear energy + collected stars so next visit requires finding them again
    sessionStorage.removeItem("t3-rocket-energy");
    sessionStorage.removeItem("t3-stars-collected");
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

    // Hint GPU compositing
    rocketEl.style.willChange = "transform, top, left, filter";

    const sky = document.querySelector<HTMLElement>(".moon-scene .sky");
    const scene = document.querySelector<HTMLElement>(".moon-scene");

    // Pre-clone stars before animation starts to avoid mid-animation layout thrash
    if (sky) {
      const existing = sky.querySelectorAll<HTMLElement>(".star");
      const fragment = document.createDocumentFragment();
      existing.forEach((s) => {
        const yStr = s.style.getPropertyValue("--y");
        const origY = parseFloat(yStr || "30");
        for (const offset of [-70, -140]) {
          const clone = s.cloneNode(true) as HTMLElement;
          clone.style.setProperty("--y", String(origY + offset));
          fragment.appendChild(clone);
        }
      });
      sky.appendChild(fragment);
    }

    const ORBIT_MS = 1600;
    const LOOPS = 1.5;
    let startTime: number | null = null;

    function orbitFrame(ts: number) {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / ORBIT_MS, 1);
      // Smooth ease-in-out for orbit
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const angle = startAngle + LOOPS * 2 * Math.PI * eased;
      const shrink = 1 - eased * 0.3; // Slightly shrink as it orbits
      const x = moonCX + Math.cos(angle) * radius * shrink;
      const y = moonCY + Math.sin(angle) * radius * shrink;
      const rot = angle * (180 / Math.PI) + 90;

      rocketEl.style.left = `${x - rW / 2}px`;
      rocketEl.style.top  = `${y - rH / 2}px`;
      rocketEl.style.transform = `rotate(${rot}deg)`;
      // Gradually brighten during orbit
      rocketEl.style.filter = `brightness(${1 + eased * 0.5})`;

      if (t < 1) {
        requestAnimationFrame(orbitFrame);
      } else {
        // Smoothly rotate to straight-up over 300ms before launching
        const finalAngle = (startAngle + LOOPS * 2 * Math.PI) * (180 / Math.PI) + 90;
        const currentTop = parseFloat(rocketEl.style.top);
        const ALIGN_MS = 300;
        const alignStart = performance.now();

        function alignFrame(ts: number) {
          const p = Math.min((ts - alignStart) / ALIGN_MS, 1);
          // Smooth ease-out
          const ease = 1 - (1 - p) * (1 - p);
          // Lerp rotation toward -90deg (pointing up)
          const targetAngle = -90;
          const angleDiff = ((targetAngle - finalAngle % 360) + 540) % 360 - 180;
          const curAngle = finalAngle + angleDiff * ease;
          rocketEl.style.transform = `rotate(${curAngle}deg)`;

          if (p < 1) {
            requestAnimationFrame(alignFrame);
          } else {
            rocketEl.style.transform = "rotate(-90deg)";
            startLaunch(currentTop);
          }
        }
        requestAnimationFrame(alignFrame);
      }
    }

    function startLaunch(rocketTop: number) {
      scene?.classList.add("scene--exiting");
      if (scene) scene.style.willChange = "transform";

      moonWrap.classList.add("moon-implode");
      document.querySelector<HTMLElement>(".moon-text")?.classList.add("text-dissolve");
      document.querySelector<HTMLElement>(".moon-scene .mist")?.classList.add("mist-out");

      const TOTAL_DUR = 2800;
      const WARP_AT = 0.3;
      const launchStart = performance.now();
      const startTop = rocketTop;
      let warpTriggered = false;

      function launchFrame(ts: number) {
        const elapsed = ts - launchStart;
        const p = Math.min(elapsed / TOTAL_DUR, 1);

        // Smooth exponential acceleration
        const e = (Math.exp(4 * p) - 1) / (Math.E * Math.E * Math.E * Math.E - 1);

        if (scene) scene.style.transform = `translateY(${Math.min(e * 55, 40)}vh)`;

        if (!warpTriggered && p >= WARP_AT) {
          warpTriggered = true;
          sky?.classList.add("warp-speed");
        }

        const ny = startTop - e * (window.innerHeight + 500);
        const bright = 1.5 + e * 3.5;

        rocketEl.style.top = `${ny}px`;
        rocketEl.style.filter = `brightness(${bright})`;

        if (p < 1) {
          requestAnimationFrame(launchFrame);
        } else {
          rocketEl.remove();
        }
      }
      requestAnimationFrame(launchFrame);

      setTimeout(navigate, TOTAL_DUR + 300);
    }

    requestAnimationFrame(orbitFrame);
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label}
    </button>
  );
}
