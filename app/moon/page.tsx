import type { CSSProperties } from "react";
import Link from "next/link";

const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 17) % 100,
  y: (i * 29) % 68,
  delay: `${(i % 8) * 0.5}s`,
}));

export default function MoonPage() {
  return (
    <main className="scene" aria-label="Night sky with crescent moon">
      <div className="sky" aria-hidden>
        {stars.map((star, index) => (
          <span
            key={`star-moon-${index}`}
            className="star"
            style={
              {
                "--x": star.x,
                "--y": star.y,
                "--delay": star.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="moon-wrap" aria-hidden>
        <div className="moon">
          <div className="moon__cover" />
        </div>
      </div>

      <div className="mist" aria-hidden />

      <div className="hero">
        <Link className="hero__btn" href="/">
          Back To Flowers
        </Link>
      </div>
    </main>
  );
}
