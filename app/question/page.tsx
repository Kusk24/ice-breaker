"use client";
import { useState, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { siteText } from "@/lib/content";

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

  const handleAgree = useCallback(() => {
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => router.push("/celebrate"));
    } else {
      router.push("/celebrate");
    }
  }, [router]);

  const handleDisagree = useCallback(() => {
    setPhase(p => p + 1);
    setImgKey(k => k + 1);
    setDodgeCount(0);
    setDodgeText(nextDodgeText());
    const next = randPos(noPosRef.current);
    noPosRef.current = next;
    setNoPos(next);
  }, []);

  const runAway = useCallback(() => {
    const next = randPos(noPosRef.current);
    noPosRef.current = next;
    setNoPos(next);
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

  // Phase 1+ agree — grows big, stays in content area
  const agreeBtnGrown = (
    <button
      key="agree-grown"
      className="q-btn q-btn--yes q-btn--grown"
      onClick={handleAgree}
      style={{
        "--agree-scale": agreeScale,
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
      <div className="sky" aria-hidden>
        {stars.map((s, i) => (
          <span key={i} className="star"
            style={{ "--x": s.x, "--y": s.y, "--delay": s.delay } as CSSProperties}
          />
        ))}
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
          {phase === 0 ? [agreeBtnInline, disagreeBtnInline] : agreeBtnGrown}
        </div>
      </div>

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
