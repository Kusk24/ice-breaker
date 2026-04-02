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

/* ─── Grass tufts ─── */
const grassTufts = [
  { x: 8, y: 8, s: 1.05, delay: "0.1s" },
  { x: 16, y: 10, s: 1.2, delay: "0s" },
  { x: 27, y: 8, s: 1.05, delay: "0.25s" },
  { x: 38, y: 6, s: 0.95, delay: "0.4s" },
  { x: 50, y: 5, s: 0.9, delay: "0.15s" },
  { x: 62, y: 6, s: 0.95, delay: "0.35s" },
  { x: 73, y: 8, s: 1.05, delay: "0.2s" },
  { x: 84, y: 10, s: 1.2, delay: "0.5s" },
  { x: 92, y: 8, s: 1.05, delay: "0.3s" },
] as const;

const sideGrassGroups = [
  { x: "18%", y: "3vh", scale: 0.95, delay: "0.2s" },
  { x: "32%", y: "2vh", scale: 0.8, delay: "0.5s" },
  { x: "68%", y: "2vh", scale: 0.8, delay: "0.8s" },
  { x: "82%", y: "3vh", scale: 0.95, delay: "1.1s" },
] as const;

const plantClusters = [
  { x: "34%", y: "1.5vh", rot: "-4deg", scale: 1.0,  alpha: 0.9, sway: "3.5s", delay: "-0.8s" },
  { x: "50%", y: "0vh",   rot: "0deg",  scale: 1.15, alpha: 1.0, sway: "4.2s", delay: "0s" },
  { x: "66%", y: "1.5vh", rot: "4deg",  scale: 1.0,  alpha: 0.9, sway: "3.8s", delay: "-1.4s" },
] as const;

/* ─── Accent leaves (scattered at different positions/sizes/angles) ─── */
const accentLeaves = [
  { left: "calc(50% + 88px)",  bottom: "72px",  s: 44, rot: 48,  flip: false, ad: "5.2s" },
  { left: "calc(50% + 52px)",  bottom: "104px", s: 40, rot: 28,  flip: true,  ad: "5.0s" },
  { left: "calc(50% + 68px)",  bottom: "38px",  s: 46, rot: 58,  flip: false, ad: "4.8s" },
  { left: "calc(50% + 28px)",  bottom: "82px",  s: 38, rot: 28,  flip: true,  ad: "4.6s" },
  { left: "calc(50% + 46px)",  bottom: "136px", s: 44, rot: 52,  flip: false, ad: "4.4s" },
  { left: "calc(50% - 4px)",   bottom: "54px",  s: 40, rot: 22,  flip: true,  ad: "4.2s" },
  { left: "calc(50% + 24px)",  bottom: "164px", s: 42, rot: 44,  flip: false, ad: "4.0s" },
  { left: "calc(50% - 12px)",  bottom: "112px", s: 38, rot: 18,  flip: true,  ad: "3.8s" },
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
  { top: "-8%",  left: "28%",   size: 28, rot: -22 },
  { top: "-7%",  left: "-118%", size: 28, rot: 12 },
  { top: "4%",   left: "55%",   size: 36, rot: -20 },
  { top: "5%",   left: "-148%", size: 36, rot: 4 },
  { top: "18%",  left: "62%",   size: 46, rot: -26 },
  { top: "20%",  left: "-190%", size: 46, rot: 8 },
  { top: "36%",  left: "72%",   size: 48, rot: -12 },
  { top: "38%",  left: "-228%", size: 52, rot: 12 },
] as const;

/* ─── Light particles floating up from each rose bud ───
 *  Each rose is rotated around its bottom-centre pivot.
 *  left  = 50% + offset + stem-h × sin(angle)
 *  bottom = bouquet-bottom(4.8vh) + stem-h × cos(angle)
 */
const roseHeadPositions = [
  { left: "calc(50% - 156px + 30vh * sin(-15deg))", bottom: "calc(4.8vh + 30vh * cos(15deg))" },
  { left: "calc(50% - 78px + 33vh * sin(-8deg))",  bottom: "calc(4.8vh + 33vh * cos(8deg))" },
  { left: "50%",                                    bottom: "calc(4.8vh + 36vh)" },
  { left: "calc(50% + 82px + 33vh * sin(8deg))",   bottom: "calc(4.8vh + 33vh * cos(8deg))" },
  { left: "calc(50% + 160px + 30vh * sin(15deg))", bottom: "calc(4.8vh + 30vh * cos(15deg))" },
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