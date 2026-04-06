"use client";
import { useRouter } from "next/navigation";

const PARTICLE_COLORS = [
  "#FF5A70", "#FF8000", "#FFD766",
  "#EEF6FF", "#C0D8EE", "#fdeea5", "#ffffff", "#FF6BD6",
];

export default function RocketCta({ className, label }: { className?: string; label: string }) {
  const router = useRouter();

  function navigate() {
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => router.push("/question"));
    } else {
      router.push("/question");
    }
  }

  function explode(cx: number, cy: number) {
    for (let i = 0; i < 48; i++) {
      const p = document.createElement("div");
      p.className = "explosion-particle";
      const angle = (i / 48) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const dist  = 80 + Math.random() * 260;
      const size  = 6 + Math.random() * 20;
      const dur   = 0.5 + Math.random() * 0.9;
      const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      const streak = Math.random() < 0.35;
      p.style.cssText = [
        `left:${cx}px`, `top:${cy}px`,
        `width:${streak ? size * 3 : size}px`, `height:${size}px`,
        `border-radius:50%`, `background:${color}`,
        `--tx:${Math.cos(angle) * dist}px`, `--ty:${Math.sin(angle) * dist}px`,
        `--dur:${dur}s`,
      ].join(";");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), (dur + 0.2) * 1000);
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
    // which would otherwise clip position:fixed to the scene element
    // Freeze at current visual position before moving to body
    rocketEl.style.animation = "none";
    rocketEl.style.opacity = "1"; // CSS base has opacity:0, animation fill was holding it at 1
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

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / ORBIT_MS, 1);
      // ease-in so rocket accelerates into explosion
      const eased = t * t;

      const angle = startAngle + LOOPS * 2 * Math.PI * eased;
      const x = moonCX + Math.cos(angle) * radius;
      const y = moonCY + Math.sin(angle) * radius;
      // face direction of travel
      const rot = angle * (180 / Math.PI) + 90;

      rocketEl.style.left = `${x - rW / 2}px`;
      rocketEl.style.top  = `${y - rH / 2}px`;
      rocketEl.style.transform = `rotate(${rot}deg)`;

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // Orbit done — explode, then trigger scene exit
        explode(x, y);
        rocketEl.remove();

        moonWrap.classList.add("moon-implode");
        document.querySelector<HTMLElement>(".moon-text")?.classList.add("text-dissolve");
        document.querySelector<HTMLElement>(".moon-scene .sky")?.classList.add("warp-speed");
        document.querySelector<HTMLElement>(".moon-scene .mist")?.classList.add("mist-out");

        setTimeout(navigate, 2800);
      }
    }

    requestAnimationFrame(frame);
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label}
    </button>
  );
}
