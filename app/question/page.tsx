"use client";
import { useState, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { siteText } from "@/lib/content";
import T3Nebula from "@/app/components/T3Nebula";

const isProd = process.env.NODE_ENV === "production";
const base = isProd ? "/ice-breaker" : "";

const QUESTIONS = [
  siteText.questionOne,   siteText.questionTwo,   siteText.questionThree,
  siteText.questionFour,  siteText.questionFive,   siteText.questionSix,
  siteText.questionSeven, siteText.questionEight,  siteText.questionNine,
  siteText.questionTen,   siteText.questionEleven,
];

const DODGE_TEXTS = ["whyyyyy T_T", "pls not here", "Nooooooo", "...", "sate soe p", "hahaha catch me!!!", "wahahaha ꉂ(˵˃ ᗜ ˂˵)", "Don't you dareeee", "Cruel T3 ly lr?", "ayy nww", "blah blah", "e shuu", "hw byr", "Thae Thae Thu Aungggg ( ｡ •̀ ᴖ •́ ｡)💢"];

const IMAGE_FILES = [
  "1.png","2.JPG","3.JPG","4.png","5.JPG",
  "6.JPG","7.JPG","8.JPG","9.JPG","10.JPG","11.JPG",
];

const stars = Array.from({ length: 50 }, (_, i) => ({
  x: (i * 23) % 100,
  y: (i * 37) % 92,
  delay: `${(i % 7) * 0.6}s`,
}));

// ── Multiverse: bubble universes drifting behind the question ──
// Each bubble has a position (vw/vh), size (vmin), drift offset & duration,
// and a hue tint so they don't all look identical.
// Each palette: core = brightest cloud, mid = secondary cloud, accent = small vivid clump
const BUBBLE_HUES = [
  { core: "#6ab8ff", mid: "#a855f7", accent: "#ec4899" }, // blue + violet + pink
  { core: "#c084fc", mid: "#ec4899", accent: "#60a5fa" }, // violet + pink + blue
  { core: "#f472b6", mid: "#8b5cf6", accent: "#06b6d4" }, // pink + purple + cyan
  { core: "#38bdf8", mid: "#818cf8", accent: "#f0abfc" }, // cyan + indigo + fuchsia
  { core: "#a78bfa", mid: "#f472b6", accent: "#fde047" }, // lavender + pink + gold
];

const bubbles = [
  { x: 12,  y: 18, size: 38, driftX: -4, driftY:  3, dur: 22, delay: 0,   hue: 0, spin: 90  },
  { x: 78,  y: 15, size: 26, driftX:  3, driftY:  5, dur: 18, delay: 1.5, hue: 1, spin: 70  },
  { x: 88,  y: 62, size: 44, driftX: -5, driftY: -3, dur: 26, delay: 3,   hue: 0, spin: 110 },
  { x: 8,   y: 72, size: 48, driftX:  4, driftY: -4, dur: 28, delay: 2,   hue: 2, spin: 120 },
  { x: 48,  y: 8,  size: 20, driftX:  2, driftY:  4, dur: 16, delay: 4.5, hue: 3, spin: 60  },
  { x: 62,  y: 48, size: 22, driftX: -3, driftY:  2, dur: 17, delay: 2.8, hue: 4, spin: 80  },
  { x: 30,  y: 55, size: 30, driftX:  3, driftY: -3, dur: 21, delay: 0.8, hue: 1, spin: 95  },
  { x: 96,  y: 90, size: 14, driftX: -2, driftY: -3, dur: 14, delay: 3.5, hue: 3, spin: 50  },
  { x: 42,  y: 88, size: 18, driftX:  2, driftY: -2, dur: 15, delay: 1.2, hue: 0, spin: 55  },
];

const TOTAL = QUESTIONS.length; // 11

// Keep the new random pos far from the old one
function randPos(prev?: { x: number; y: number }) {
  let x: number, y: number;
  let attempts = 0;
  do {
    x = 8 + Math.random() * 78;
    y = 10 + Math.random() * 75;
    attempts++;
  } while (
    prev &&
    attempts < 20 &&
    Math.abs(x - prev.x) < 30 &&
    Math.abs(y - prev.y) < 20
  );
  return { x, y };
}

export default function QuestionPage() {
  const router = useRouter();
  const [phase, setPhase]           = useState(0);
  const [imgKey, setImgKey]         = useState(0);
  const [noPos, setNoPos]           = useState(() => randPos());
  const [yesPos, setYesPos]         = useState<{ x: number; y: number } | null>(null);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [dodgeText, setDodgeText]   = useState(siteText.disagreeText);
  const noPosRef = useRef(noPos);
  const deckRef = useRef<string[]>([]);

  function nextDodgeText() {
    if (deckRef.current.length === 0) {
      // Reshuffle all texts
      deckRef.current = [...DODGE_TEXTS].sort(() => Math.random() - 0.5);
    }
    return deckRef.current.pop()!;
  }

  const isFinal   = phase === TOTAL;
  const questionText = phase === 0 ? siteText.question : QUESTIONS[phase - 1];
  const imgSrc    = phase > 0 ? `${base}/reactions/${IMAGE_FILES[phase - 1]}` : null;

  // agree: grows from 1→ 5× across 11 phases (exponential feel)
  const agreeScale = phase === 0 ? 1 : Math.min(1 + phase * 0.38, 5.2);
  // disagree: shrinks from 1 → 0.42× (still tappable) across phases
  const noScale    = phase === 0 ? 1 : Math.max(1 - (phase - 1) * 0.053, 0.42);

  // Phase 1 = 1 dodge, phase 2 = 2 dodges, phase 3+ = 3 dodges, final = unlimited
  const maxDodges = isFinal ? Infinity : Math.min(phase, 3);
  const needsDodge = phase > 0 && dodgeCount < maxDodges;

  const handleAgree = useCallback(async () => {
    // Await the email send before navigating so formsubmit actually receives it.
    // A 2.5s timeout prevents hanging if their API is slow/down.
    const url = `https://formsubmit.co/ajax/${siteText.receiverEmail}`;
    const payload = {
      Answer: siteText.agreeText,
      DisagreeCount: phase,
      _subject: "T3 agreed! 💕",
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      // Timeout or network error — fire one last keepalive attempt so the send
      // continues even after navigation.
      try {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    } finally {
      clearTimeout(timeout);
    }

    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => {
        router.push("/celebrate");
        return new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
      });
    } else {
      router.push("/celebrate");
    }
  }, [router, phase]);

  const handleDisagree = useCallback(() => {
    setPhase(p => p + 1);
    setImgKey(k => k + 1);
    setDodgeCount(0);
    setDodgeText(nextDodgeText());
    setYesPos(null);
    const next = randPos(noPosRef.current);
    noPosRef.current = next;
    setNoPos(next);
  }, []);

  const runAway = useCallback(() => {
    const prev = noPosRef.current;
    const next = randPos(prev);
    noPosRef.current = next;
    setNoPos(next);
    setYesPos(prev);
    setDodgeCount(c => c + 1);
    setDodgeText(nextDodgeText());
  }, []);

  // Phase 0 buttons (inline, normal)
  const agreeBtnInline = (
    <button
      key="agree"
      className="q-btn q-btn--yes"
      onClick={handleAgree}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as CSSProperties}
    >
      {siteText.agreeText}
    </button>
  );

  const disagreeBtnInline = (
    <button
      key="disagree"
      className="q-btn q-btn--no"
      onClick={handleDisagree}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as CSSProperties}
    >
      {siteText.disagreeText}
    </button>
  );

  // Phase 1+ agree — grows big; swaps into disagree's previous spot after each dodge
  const agreeFloating = yesPos !== null;
  const agreeBtnGrown = (
    <button
      key="agree-grown"
      className={`q-btn q-btn--yes q-btn--grown${agreeFloating ? " q-btn--floating" : ""}`}
      onClick={handleAgree}
      style={{
        "--agree-scale": agreeScale,
        ...(agreeFloating
          ? { left: `${yesPos!.x}vw`, top: `${yesPos!.y}vh` }
          : {}),
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      } as CSSProperties}
    >
      {siteText.agreeText}
    </button>
  );

  // Phase 1+ disagree — floating, shrinking
  const disagreeBtnFloat = (
    <button
      key="disagree-float"
      className={`q-btn q-btn--no q-btn--floating${needsDodge ? " q-btn--runaway" : ""}`}
      style={{
        left: `${noPos.x}vw`,
        top:  `${noPos.y}vh`,
        "--no-scale": noScale,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      } as CSSProperties}
      onClick={needsDodge ? undefined : handleDisagree}
      onMouseEnter={needsDodge ? runAway : undefined}
      onTouchStart={needsDodge ? runAway : undefined}
    >
      {siteText.disagreeText}
    </button>
  );

  return (
    <main className="scene question-scene">
      <T3Nebula />
      <div className="multiverse-label" aria-hidden>
        <span className="multiverse-label__text">{siteText.multiverseLabel}</span>
      </div>
      <div className="sky" aria-hidden>
        {stars.map((s, i) => (
          <span key={i} className="star"
            style={{ "--x": s.x, "--y": s.y, "--delay": s.delay } as CSSProperties}
          />
        ))}
      </div>

      {/* Multiverse — bubble universes drifting behind the question */}
      <div className="multiverse" aria-hidden>
        {bubbles.map((b, i) => {
          const hue = BUBBLE_HUES[b.hue];
          return (
            <div
              key={i}
              className="bubble-universe"
              style={{
                "--bx": `${b.x}vw`,
                "--by": `${b.y}vh`,
                "--bsize": `${b.size}vmin`,
                "--drift-x": `${b.driftX}vw`,
                "--drift-y": `${b.driftY}vh`,
                "--dur": `${b.dur}s`,
                "--delay": `${b.delay}s`,
                "--spin": `${b.spin}s`,
                "--hue-core": hue.core,
                "--hue-mid": hue.mid,
                "--hue-accent": hue.accent,
              } as CSSProperties}
            >
              <div className="bubble-universe__stars" />
              <div className="bubble-universe__rim" />
            </div>
          );
        })}
      </div>

      {/* Image — natural flow, above content, no overlap */}
      {imgSrc && (
        <div key={imgKey} className="reaction-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt="" className="reaction-img" />
        </div>
      )}

      <div className="question-content">
        <h1 className="question-title" key={phase}>
          {(() => {
            const lines = questionText.split(/,|\n/).map((seg, li) => (li === 0 ? seg : seg.trimStart()));
            let ci = 0;
            return lines.map((line, li) => (
              <span key={li} className="question-title__line">
                {line.split("").map((ch) => {
                  const idx = ci++;
                  return (
                    <span key={idx} className="question-char" style={{ "--qi": idx } as CSSProperties}>
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  );
                })}
                {li < lines.length - 1 && (
                  <span className="question-char" style={{ "--qi": ci++ } as CSSProperties}>,</span>
                )}
              </span>
            ));
          })()}
        </h1>

        <div
          className={`question-choices${phase > 0 ? " question-choices--reacted" : ""}`}
          style={{ "--agree-scale": agreeScale } as CSSProperties}
        >
          {phase === 0
            ? [agreeBtnInline, disagreeBtnInline]
            : agreeFloating
              ? null
              : agreeBtnGrown}
        </div>
      </div>

      {/* Floating agree — lives outside flow so it can take disagree's old spot */}
      {phase > 0 && agreeFloating && agreeBtnGrown}

      {/* Floating disagree lives outside flow so it can go anywhere */}
      {phase > 0 && disagreeBtnFloat}

      {/* Speech bubble — outside button so it's never affected by button's scale */}
      {phase > 0 && dodgeText && (
        <span
          key={dodgeText + noPos.x + noPos.y}
          className="dodge-bubble"
          style={{ left: `${noPos.x}vw`, top: `calc(${noPos.y}vh - 52px)` } as CSSProperties}
        >
          {dodgeText}
        </span>
      )}
    </main>
  );
}
