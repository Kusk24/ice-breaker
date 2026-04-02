import type { CSSProperties } from "react";
import { siteText } from "@/lib/content";

/* ─── Stars ─── */
const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 17) % 100,
  y: (i * 29) % 68,
  delay: `${(i % 8) * 0.5}s`,
}));

/* ─── Roses ─── */
const roses = [1, 2, 3, 4, 5] as const;

/* ─── Grass tufts — flanking left & right sides only, like reference ─── */
const grassTufts = [
  { x:  3, y: 6,  s: 1.15, delay: "0s"    },
  { x:  8, y: 8,  s: 1.05, delay: "0.15s" },
  { x: 14, y: 7,  s: 1.1,  delay: "0.3s"  },
  { x: 20, y: 6,  s: 0.9,  delay: "0.45s" },
  { x: 80, y: 6,  s: 0.9,  delay: "0.4s"  },
  { x: 86, y: 7,  s: 1.1,  delay: "0.2s"  },
  { x: 92, y: 8,  s: 1.05, delay: "0.1s"  },
  { x: 97, y: 6,  s: 1.15, delay: "0.35s" },
] as const;

const sideGrassGroups = [
  { x: "28%", y: "2vh", scale: 1.0,  delay: "0.2s" },
  { x: "36%", y: "1vh", scale: 0.85, delay: "0.5s" },
  { x: "64%", y: "1vh", scale: 0.85, delay: "0.8s" },
  { x: "72%", y: "2vh", scale: 1.0,  delay: "1.1s" },
] as const;

const plantClusters = [
  { x: "42%", y: "0vh",   rot: "-5deg", scale: 0.95, alpha: 0.88, sway: "3.5s", delay: "-0.8s" },
  { x: "50%", y: "0vh",   rot: "0deg",  scale: 1.15, alpha: 1.0,  sway: "4.2s", delay: "0s" },
  { x: "58%", y: "0vh",   rot: "5deg",  scale: 0.95, alpha: 0.88, sway: "3.8s", delay: "-1.4s" },
] as const;

/* ─── Accent leaves (scattered at different positions/sizes/angles) ─── */
const accentLeaves = [
  { left: "calc(50% + 64px)",  bottom: "60px",  s: 44, rot: 48,  flip: false, ad: "5.2s" },
  { left: "calc(50% - 64px)",  bottom: "60px",  s: 44, rot: 48,  flip: true,  ad: "5.0s" },
  { left: "calc(50% + 88px)",  bottom: "28px",  s: 40, rot: 58,  flip: false, ad: "4.8s" },
  { left: "calc(50% - 88px)",  bottom: "28px",  s: 40, rot: 58,  flip: true,  ad: "4.6s" },
  { left: "calc(50% + 48px)",  bottom: "110px", s: 42, rot: 38,  flip: false, ad: "4.4s" },
  { left: "calc(50% - 48px)",  bottom: "110px", s: 42, rot: 38,  flip: true,  ad: "4.2s" },
  { left: "calc(50% + 20px)",  bottom: "155px", s: 38, rot: 22,  flip: false, ad: "4.0s" },
  { left: "calc(50% - 20px)",  bottom: "155px", s: 38, rot: 22,  flip: true,  ad: "3.8s" },
] as const;

/* ─── Front stem leaf pair positions ─── */
const frontStemLeaves = [
  { top: "-40px", right: true,  ad: "5.5s", scale: 0.65 },
  { top: "-40px", right: false, ad: "5.2s", scale: 0.65 },
  { top: "-18px", right: true,  ad: "4.9s", scale: 0.85 },
  { top: "-18px", right: false, ad: "4.6s", scale: 0.85 },
  { top: "8px",   right: true,  ad: "4.3s", scale: 1.0 },
  { top: "8px",   right: false, ad: "4.1s", scale: 1.0 },
  { top: "34px",  right: true,  ad: "3.8s", scale: 1.0 },
  { top: "34px",  right: false, ad: "3.5s", scale: 1.0 },
] as const;

/* ─── Grass fern leaves (half-circle leaves on curved stems) ─── */
const fernLeaves1 = [
  { top: "-12%", left: "18%",   size: 26, rot: -18 },
  { top: "-11%", left: "-108%", size: 26, rot: 16 },
  { top: "5%",   left: "46%",   size: 34, rot: -24 },
  { top: "6%",   left: "-150%", size: 34, rot: 6 },
  { top: "24%",  left: "60%",   size: 44, rot: -28 },
  { top: "26%",  left: "-188%", size: 44, rot: 10 },
  { top: "44%",  left: "74%",   size: 50, rot: -14 },
  { top: "46%",  left: "-236%", size: 54, rot: 14 },
] as const;

/* ─── Light particles floating up from each rose bud ───
 *  Each rose is rotated around its bottom-centre pivot.
 *  left  = 50% + offset + stem-h × sin(angle)
 *  bottom = bouquet-bottom(4.8vh) + stem-h × cos(angle)
 */
const roseHeadPositions = [
  { left: "calc(50% - 92px + 28vh * sin(-14deg))",  bottom: "calc(4.8vh + 28vh * cos(14deg))" },
  { left: "calc(50% - 44px + 32vh * sin(-7deg))",   bottom: "calc(4.8vh + 32vh * cos(7deg))" },
  { left: "50%",                                     bottom: "calc(4.8vh + 37vh)" },
  { left: "calc(50% + 48px + 32vh * sin(7deg))",    bottom: "calc(4.8vh + 32vh * cos(7deg))" },
  { left: "calc(50% + 96px + 28vh * sin(14deg))",   bottom: "calc(4.8vh + 28vh * cos(14deg))" },
] as const;

const lightParticles = roseHeadPositions.flatMap((pos, roseIdx) =>
  Array.from({ length: 6 }, (_, i) => ({
    left: pos.left,
    bottom: pos.bottom,
    offsetX: `${(i % 3 - 1) * 14}px`,
    delay: `${(i * 0.6 + roseIdx * 0.3).toFixed(2)}s`,
    cool: i % 2 === 0,
  })),
);

/* ─── Petal particles (pink, floating upward from each petal top) ─── */
const petalFlow = roseHeadPositions.flatMap((pos, roseIndex) =>
  Array.from({ length: 5 }, (_, i) => ({
    left: pos.left,
    bottom: pos.bottom,
    offsetX: `${((i % 3) - 1) * 12}px`,
    delay: `${(i * 0.35 + roseIndex * 0.2).toFixed(2)}s`,
    duration: `${3.5 + ((i + roseIndex) % 4) * 0.4}s`,
  })),
);

/* ─── Green particles (floating up from grass area) ─── */
const greenFlow = Array.from({ length: 22 }, (_, i) => ({
  x: 18 + ((i * 19) % 64),
  y: 60 + ((i * 7) % 22),
  delay: `${(i % 10) * 0.32}s`,
  duration: `${3.8 + ((i * 0.22) % 1.4)}s`,
}));

export default function Home() {
  return (
    <main className="scene" aria-label="Red roses with magical grass and flowing particles at night">
      <div className="sky" aria-hidden>
        {stars.map((star, index) => (
          <span
            key={`star-${index}`}
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

      <section className="garden" aria-hidden>
        <div className="edge-grass edge-grass--left">
          <span className="edge-grass__blade edge-grass__blade--1" />
          <span className="edge-grass__blade edge-grass__blade--2" />
          <span className="edge-grass__blade edge-grass__blade--3" />
          <span className="edge-grass__blade edge-grass__blade--4" />
          <span className="edge-grass__blade edge-grass__blade--5" />
          <span className="edge-grass__blade edge-grass__blade--6" />
        </div>
        <div className="edge-grass edge-grass--right">
          <span className="edge-grass__blade edge-grass__blade--1" />
          <span className="edge-grass__blade edge-grass__blade--2" />
          <span className="edge-grass__blade edge-grass__blade--3" />
          <span className="edge-grass__blade edge-grass__blade--4" />
          <span className="edge-grass__blade edge-grass__blade--5" />
          <span className="edge-grass__blade edge-grass__blade--6" />
        </div>

        <div className="meadow">
          {grassTufts.map((tuft, index) => (
            <span
              key={`tuft-${index}`}
              className="grass-tuft"
              style={
                {
                  "--x": `${tuft.x}%`,
                  "--y": `${tuft.y}%`,
                  "--scale": tuft.s,
                  "--delay": tuft.delay,
                } as CSSProperties
              }
            >
              <span className="tuft-blade tuft-blade--1" />
              <span className="tuft-blade tuft-blade--2" />
              <span className="tuft-blade tuft-blade--3" />
              <span className="tuft-blade tuft-blade--4" />
            </span>
          ))}
        </div>

        <div className="spread-grass">
          {sideGrassGroups.map((g, i) => (
            <div
              key={`spread-grass-${i}`}
              className="spread-grass__group"
              style={
                {
                  "--gx": g.x,
                  "--gy": g.y,
                  "--gs": g.scale,
                  "--gd": g.delay,
                } as CSSProperties
              }
            >
              <span className="spread-grass__blade spread-grass__blade--1" />
              <span className="spread-grass__blade spread-grass__blade--2" />
              <span className="spread-grass__blade spread-grass__blade--3" />
              <span className="spread-grass__blade spread-grass__blade--4" />
            </div>
          ))}
        </div>

        {plantClusters.map((cluster, clusterIndex) => (
          <div
            key={`plant-cluster-${clusterIndex}`}
            className="plant-base"
            style={
              {
                "--cluster-x": cluster.x,
                "--cluster-y": cluster.y,
                "--cluster-rot": cluster.rot,
                "--cluster-scale": cluster.scale,
                "--cluster-alpha": cluster.alpha,
                "--cluster-sway": cluster.sway,
                "--cluster-delay": cluster.delay,
              } as CSSProperties
            }
          >
            <div className="long-stem">
              <div className="long-stem__top" />
              <div className="long-stem__bottom" />
            </div>

            <div className="vine-arc vine-arc--left" />
            <div className="vine-arc vine-arc--right" />

            <div className="grass-fern grass-fern--1">
              <div className="grass-fern__top" />
              <div className="grass-fern__bottom" />
              {fernLeaves1.map((fl, i) => (
                <span
                  key={`fern1-${clusterIndex}-${i}`}
                  className="grass-fern__leaf"
                  style={
                    {
                      top: fl.top,
                      left: fl.left,
                      "--size": `${fl.size}px`,
                      "--li": i,
                      transform: `rotate(${fl.rot}deg)`,
                    } as CSSProperties
                  }
                />
              ))}
              <div className="grass-fern__overlay" />
            </div>

            <div className="grass-fern grass-fern--2">
              <div className="grass-fern__top" />
              <div className="grass-fern__bottom" />
              {fernLeaves1.slice(0, 6).map((fl, i) => (
                <span
                  key={`fern2-${clusterIndex}-${i}`}
                  className="grass-fern__leaf"
                  style={
                    {
                      top: fl.top,
                      left: fl.left,
                      "--size": `${fl.size}px`,
                      "--li": i,
                      transform: `rotate(${fl.rot}deg)`,
                    } as CSSProperties
                  }
                />
              ))}
              <div className="grass-fern__overlay" />
            </div>

            <div className="front-stem">
              {frontStemLeaves.map((leaf, i) => (
                <div
                  key={`fstem-${clusterIndex}-${i}`}
                  className={`front-stem__leaf-wrap ${leaf.right ? "front-stem__leaf-wrap--right" : "front-stem__leaf-wrap--left"}`}
                  style={
                    {
                      "--top": leaf.top,
                      "--ad": leaf.ad,
                      transform: leaf.right
                        ? `rotate(10deg) scale(${leaf.scale})`
                        : `rotateY(-180deg) rotate(5deg) scale(${leaf.scale})`,
                    } as CSSProperties
                  }
                >
                  <div className="front-stem__leaf" />
                </div>
              ))}
              <div className="front-stem__line" />
            </div>

            {accentLeaves.map((al, i) => (
              <span
                key={`accent-${clusterIndex}-${i}`}
                className={`accent-leaf${al.flip ? " accent-leaf--flip" : ""}`}
                style={
                  {
                    left: al.left,
                    bottom: al.bottom,
                    "--s": `${al.s}px`,
                    "--rot": `${al.rot}deg`,
                    "--ad": al.ad,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        ))}

        <div className="bouquet">
          {roses.map((number) => (
            <article key={number} className={`rose rose--${number}`}>
              <div className="rose__stem" />
              <span className="rose__leaf rose__leaf--1" />
              <span className="rose__leaf rose__leaf--2" />
              <span className="rose__leaf rose__leaf--3" />
              <span className="rose__leaf rose__leaf--4" />
              <span className="rose__leaf rose__leaf--5" />
              <span className="rose__leaf rose__leaf--6" />

              <div className="rose__bud-glow" />

              <div className="rose__bud">
                <span className="rose__petal rose__petal--1" />
                <span className="rose__petal rose__petal--2" />
                <span className="rose__petal rose__petal--3" />
                <span className="rose__petal rose__petal--4" />
                <span className="rose__petal rose__petal--5" />
                <span className="rose__petal rose__petal--6" />
                <span className="rose__petal rose__petal--7" />
                <span className="rose__core" />
              </div>
            </article>
          ))}
        </div>

        <div className="particle-layer" style={{ zIndex: 6 }}>
          {lightParticles.map((lp, index) => (
            <span
              key={`light-${index}`}
              className={`light-particle ${lp.cool ? "light-particle--cool" : "light-particle--warm"}`}
              style={
                {
                  left: lp.left,
                  bottom: lp.bottom,
                  marginLeft: lp.offsetX,
                  "--ld": lp.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="particle-layer">
          {petalFlow.map((p, index) => (
            <span
              key={`petal-flow-${index}`}
              className="particle particle--petal"
              style={
                {
                  left: p.left,
                  bottom: p.bottom,
                  marginLeft: p.offsetX,
                  "--delay": p.delay,
                  "--duration": p.duration,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="particle-layer">
          {greenFlow.map((p, index) => (
            <span
              key={`green-flow-${index}`}
              className="particle particle--green"
              style={
                {
                  "--x": p.x,
                  "--y": p.y,
                  "--delay": p.delay,
                  "--duration": p.duration,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </section>

      <div className="hero">
        <h1 className="hero__title">
          {[...siteText.title].map((char, i) => (
            <span
              key={`t-${i}`}
              className="hero__char"
              style={{ "--ci": i } as CSSProperties}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <p className="hero__subtitle">
          {[...siteText.subtitle].map((char, i) => (
            <span
              key={`s-${i}`}
              className="hero__char hero__char--sub"
              style={{ "--ci": i } as CSSProperties}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </p>
        <button className="hero__btn" type="button">
          {siteText.buttonOne}
        </button>
      </div>
    </main>
  );
}