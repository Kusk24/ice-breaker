import type { CSSProperties } from "react";
import Link from "next/link";
import GeminiConstellation from "../components/GeminiConstellation";
import MoonBackButton from "../components/MoonBackButton";
import RocketCta from "../components/RocketCta";
import RocketFuel from "../components/RocketFuel";
import { siteText } from "@/lib/content";

const isProd = process.env.NODE_ENV === "production";
const rocketSrc = `${isProd ? "/ice-breaker" : ""}/rocket.svg`;
const thaethuSrc = `${isProd ? "/ice-breaker" : ""}/thaethu.png`;

const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 17) % 100,
  y: (i * 29) % 68,
  delay: `${(i % 8) * 0.5}s`,
}));

const moonLines = siteText.moonText
  .split(",")
  .map((seg, i) => (i === 0 ? seg : seg.trimStart()));

const rocketDelaySeconds = 7.5 + siteText.moonText.length * 0.065 + 0.95;
const rocketDelay = `${rocketDelaySeconds.toFixed(2)}s`;
const rocketLabel = siteText.buttonThree.trim() || "Button Three";

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thaethuSrc} alt="" className="moon__portrait" />
          </div>
        </div>
      </div>

      <div className="mist" aria-hidden />

      <Link href="/constellation" className="gemini-constellation" aria-label="Explore Gemini constellation">
        <GeminiConstellation />
      </Link>

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

      <RocketFuel rocketDelay={rocketDelay}>
        <div
          className="rocket-flight"
          style={{ "--rocket-delay": rocketDelay } as CSSProperties}
        >
          <div className="rocket-flight__craft">
            <span className="rocket-flight__trail" aria-hidden />
            <span className="rocket-flight__flame rocket-flight__flame--outer" aria-hidden />
            <span className="rocket-flight__flame rocket-flight__flame--core" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rocketSrc} alt="" className="rocket-flight__image" />
            <RocketCta className="rocket-flight__cta" label={rocketLabel} />
          </div>
        </div>
      </RocketFuel>

      <div className="moon-actions">
        <MoonBackButton className="hero__btn moon-actions__btn" />
      </div>
    </main>
  );
}
