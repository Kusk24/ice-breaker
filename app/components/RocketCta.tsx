"use client";
import { useRouter } from "next/navigation";

function isIpadViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(
    "(hover: none) and (pointer: coarse) and (min-width: 768px) and (max-width: 1366px)"
  ).matches;
}

function getPageZoom() {
  if (typeof window === "undefined") return 1;
  // iPad Safari: position:fixed coords are in physical viewport space;
  // getBoundingClientRect() already returns visual coords — no zoom division needed.
  if (isIpadViewport()) return 1;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--page-zoom").trim();
  const n = parseFloat(v);
  return n > 0 ? n : 1;
}

export default function RocketCta({ className, label }: { className?: string; label: string }) {
  const router = useRouter();

  function navigate() {
    sessionStorage.setItem("t3-rocket-incoming", "1");
    // Clear energy + collected stars so next visit requires finding them again
    sessionStorage.removeItem("t3-rocket-energy");
    sessionStorage.removeItem("t3-stars-collected");
    router.push("/countdown");
  }

  function handleClick() {
    const rocketElMaybe = document.querySelector<HTMLElement>(".rocket-flight");
    const moonWrapMaybe = document.querySelector<HTMLElement>(".moon-wrap--journey");
    if (!rocketElMaybe || !moonWrapMaybe) { navigate(); return; }
    const rocketEl = rocketElMaybe;
    const moonWrap = moonWrapMaybe;

    const z = getPageZoom();
    const rRect = rocketEl.getBoundingClientRect();
    const mRect = moonWrap.getBoundingClientRect();

    const moonCX = (mRect.left + mRect.width / 2) / z;
    const moonCY = (mRect.top + mRect.height / 2) / z;
    const rocketCX = (rRect.left + rRect.width / 2) / z;
    const rocketCY = (rRect.top + rRect.height / 2) / z;
    const rW = rRect.width / z;
    const rH = rRect.height / z;

    // Move rocket to body — escapes scene's contain:paint layout
    rocketEl.style.animation = "none";
    rocketEl.style.opacity = "1";
    rocketEl.style.pointerEvents = "none";
    document.body.appendChild(rocketEl);
    rocketEl.style.position = "fixed";
    rocketEl.style.margin = "0";
    rocketEl.style.zIndex = "1000";
    // Use setProperty 'important' to override the iPad CSS !important rule
    // (.rocket-flight { left/top: !important }) which would otherwise block
    // every inline style.left/top update and freeze the orbit in place.
    rocketEl.style.setProperty("left", `${rocketCX - rW / 2}px`, "important");
    rocketEl.style.setProperty("top",  `${rocketCY - rH / 2}px`, "important");
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

    // Pre-clone stars before animation starts to avoid mid-animation layout thrash.
    // On iPad only one offset row is cloned (half the DOM nodes) since the warp
    // animation is already GPU-optimised there and extra elements add rAF cost.
    if (sky) {
      const existing = sky.querySelectorAll<HTMLElement>(".star");
      const offsets = isIpadViewport() ? [-70] : [-70, -140];
      const fragment = document.createDocumentFragment();
      existing.forEach((s) => {
        const yStr = s.style.getPropertyValue("--y");
        const origY = parseFloat(yStr || "30");
        for (const offset of offsets) {
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
    // iPad 11/13: skip per-frame filter + throttle orbit to ~30fps. Filter
    // changes re-rasterize the craft each frame; iPad already flattens the
    // craft's drop-shadow so the brightness ramp is barely visible anyway.
    const ipad = isIpadViewport();
    let orbitSkip = false;

    function orbitFrame(ts: number) {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / ORBIT_MS, 1);

      if (ipad && orbitSkip && t < 1) {
        orbitSkip = false;
        requestAnimationFrame(orbitFrame);
        return;
      }
      orbitSkip = true;

      // Smooth ease-in-out for orbit
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const angle = startAngle + LOOPS * 2 * Math.PI * eased;
      const shrink = 1 - eased * 0.3; // Slightly shrink as it orbits
      const x = moonCX + Math.cos(angle) * radius * shrink;
      const y = moonCY + Math.sin(angle) * radius * shrink;
      const rot = angle * (180 / Math.PI) + 90;

      rocketEl.style.setProperty("left", `${x - rW / 2}px`, "important");
      rocketEl.style.setProperty("top",  `${y - rH / 2}px`, "important");
      rocketEl.style.transform = `rotate(${rot}deg)`;
      if (!ipad) {
        // Gradually brighten during orbit
        rocketEl.style.filter = `brightness(${1 + eased * 0.5})`;
      }

      if (t < 1) {
        requestAnimationFrame(orbitFrame);
      } else {
        // Smoothly rotate to straight-up over 300ms before launching
        const finalAngle = (startAngle + LOOPS * 2 * Math.PI) * (180 / Math.PI) + 90;
        const currentTop = parseFloat(rocketEl.style.getPropertyValue("top"));
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
      // iPad: ~30fps + skip rocket filter updates. The warp-speed stars +
      // scene translate already dominate the frame budget on iPad 11/13.
      let launchSkip = false;

      function launchFrame(ts: number) {
        const elapsed = ts - launchStart;
        const p = Math.min(elapsed / TOTAL_DUR, 1);

        if (ipad && launchSkip && p < 1) {
          launchSkip = false;
          requestAnimationFrame(launchFrame);
          return;
        }
        launchSkip = true;

        // Smooth exponential acceleration
        const e = (Math.exp(4 * p) - 1) / (Math.E * Math.E * Math.E * Math.E - 1);

        if (scene) scene.style.transform = `translateY(${Math.min(e * 55, 40)}vh)`;

        if (!warpTriggered && p >= WARP_AT) {
          warpTriggered = true;
          sky?.classList.add("warp-speed");
        }

        const ny = startTop - e * (window.innerHeight / z + 500);

        rocketEl.style.setProperty("top", `${ny}px`, "important");
        if (!ipad) {
          rocketEl.style.filter = `brightness(${1.5 + e * 3.5})`;
        }

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
