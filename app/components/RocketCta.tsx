"use client";
import { useRouter } from "next/navigation";

const PARTICLE_COLORS = [
  "#FF5A70", "#FF8000", "#FFD766",
  "#EEF6FF", "#C0D8EE", "#3558A8",
  "#fdeea5", "#ffffff",
];

export default function RocketCta({ className, label }: { className?: string; label: string }) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Shake + collapse the rocket
    const rocket = document.querySelector<HTMLElement>(".rocket-flight");
    if (rocket) rocket.classList.add("exploding");

    // Spawn particles flying in all directions
    const count = 36;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "explosion-particle";
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.6;
      const dist  = 70 + Math.random() * 220;
      const size  = 5 + Math.random() * 18;
      const dur   = 0.55 + Math.random() * 0.85;
      const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      // small chance of a streak shape instead of dot
      const isStreak = Math.random() < 0.3;

      p.style.cssText = [
        `left:${cx}px`,
        `top:${cy}px`,
        `width:${isStreak ? size * 3 : size}px`,
        `height:${size}px`,
        `border-radius:${isStreak ? "50%" : "50%"}`,
        `background:${color}`,
        `--tx:${Math.cos(angle) * dist}px`,
        `--ty:${Math.sin(angle) * dist}px`,
        `--dur:${dur}s`,
      ].join(";");

      document.body.appendChild(p);
      setTimeout(() => p.remove(), (dur + 0.2) * 1000);
    }

    // Navigate after explosion settles
    setTimeout(() => {
      if (typeof document.startViewTransition === "function") {
        document.startViewTransition(() => router.push("/question"));
      } else {
        router.push("/question");
      }
    }, 950);
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label}
    </button>
  );
}
