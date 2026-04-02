import type { CSSProperties } from "react";
import MoonBackButton from "../components/MoonBackButton";
import { siteText } from "@/lib/content";

const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 17) % 100,
  y: (i * 29) % 68,
  delay: `${(i % 8) * 0.5}s`,
}));

const moonLines = siteText.moonText
  .split(",")
  .map((seg, i) => (i === 0 ? seg : seg.trimStart()));

export default function MoonPage() {
  let ci = 0;
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
          <div className="moon__clip">
            <div className="moon__cover" />
          </div>
        </div>
      </div>

      <div className="mist" aria-hidden />

      <p className="moon-text" aria-label={siteText.moonText}>
        {moonLines.map((line, li) => (
          <span key={li} className="moon-text__line">
            {line.split("").map((char) => {
              const idx = ci++;
              return (
                <span
                  key={idx}
                  className="moon__char"
                  style={{ "--ci": idx } as CSSProperties}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </span>
        ))}
      </p>

      <div className="moon-actions">
        <MoonBackButton className="hero__btn moon-actions__btn" />
      </div>
    </main>
  );
}
