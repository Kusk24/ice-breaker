import type { CSSProperties } from "react";
import TransitionLink from "../components/TransitionLink";

const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 17) % 100,
  y: (i * 29) % 68,
  delay: `${(i % 8) * 0.5}s`,
}));

export default function MoonPage() {
  return (
    <main className="scene moon-scene" aria-label="Night sky with moon becoming full at the center">
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

      <div className="moon-wrap moon-wrap--journey" aria-hidden>
        <div className="moon moon--fullrise">
          <div className="moon__cover" />
        </div>
      </div>

      <div className="mist" aria-hidden />

      <div className="moon-actions">
        <TransitionLink className="hero__btn moon-actions__btn" href="/">
          Back To Flowers
        </TransitionLink>
      </div>
    </main>
  );
}
