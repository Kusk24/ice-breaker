"use client";
import { useId } from "react";

type Props = {
  className?: string;
};

export default function ScrollArt({ className }: Props) {
  // Each instance gets unique filter / gradient IDs so the mini button and
  // modal copy don't fight over the same `url(#…)` references.
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 750"
      className={className}
      aria-hidden
    >
      <defs>
        <filter id={id("paper-texture")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={5} result="noise" />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0.9 0 0 0  0 0 0.6 0 0  0 0 0 0.25 0"
            in="noise"
            result="coloredNoise"
          />
          <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
        </filter>

        <filter id={id("ragged-edge")} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={4} result="roughness" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="roughness"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feDropShadow dx="3" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        <filter id={id("roll-shadow")} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="15" stdDeviation="10" floodColor="#000000" floodOpacity="0.8" />
        </filter>

        <radialGradient id={id("parchment-base")} cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#f7e6c6" />
          <stop offset="40%" stopColor="#e3c286" />
          <stop offset="75%" stopColor="#bd863d" />
          <stop offset="95%" stopColor="#805018" />
          <stop offset="100%" stopColor="#4a2c09" />
        </radialGradient>

        <linearGradient id={id("top-roll-light")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#261502" />
          <stop offset="15%" stopColor="#59340b" />
          <stop offset="35%" stopColor="#e6c485" />
          <stop offset="60%" stopColor="#fdf0d5" />
          <stop offset="85%" stopColor="#b07a33" />
          <stop offset="100%" stopColor="#1c0f01" />
        </linearGradient>

        <linearGradient id={id("bottom-roll-light")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c0f01" />
          <stop offset="15%" stopColor="#b07a33" />
          <stop offset="40%" stopColor="#fdf0d5" />
          <stop offset="65%" stopColor="#e6c485" />
          <stop offset="85%" stopColor="#59340b" />
          <stop offset="100%" stopColor="#261502" />
        </linearGradient>

        <linearGradient id={id("crease-shadow-top")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#291501" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#291501" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("crease-shadow-bot")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#291501" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#291501" stopOpacity="0" />
        </linearGradient>

        <path
          id={id("sheet-path")}
          d="M 65,120 Q 85,250 60,375 Q 45,500 70,630 L 530,630 Q 555,500 540,375 Q 515,250 535,120 Z"
        />
      </defs>

      <g filter={`url(#${id("ragged-edge")})`}>
        <use href={`#${id("sheet-path")}`} transform="translate(1, 2)" fill="#361d02" />
        <use href={`#${id("sheet-path")}`} transform="translate(-1, -1)" fill="#4a2a07" />

        <use
          href={`#${id("sheet-path")}`}
          fill={`url(#${id("parchment-base")})`}
          filter={`url(#${id("paper-texture")})`}
        />

        <rect x="0" y="115" width="600" height="60" fill={`url(#${id("crease-shadow-top")})`} />
        <rect x="0" y="575" width="600" height="60" fill={`url(#${id("crease-shadow-bot")})`} />
      </g>

      <g filter={`url(#${id("paper-texture")})`} opacity="0.4">
        <ellipse cx="140" cy="250" rx="60" ry="90" fill="#6b4212" style={{ filter: "blur(20px)" }} />
        <ellipse cx="460" cy="520" rx="80" ry="60" fill="#4a2c09" style={{ filter: "blur(25px)" }} />
        <ellipse cx="480" cy="200" rx="50" ry="120" fill="#805018" style={{ filter: "blur(15px)" }} />
        <ellipse cx="100" cy="550" rx="70" ry="50" fill="#361d02" style={{ filter: "blur(18px)" }} />
      </g>

      <g filter={`url(#${id("roll-shadow")})`}>
        <path
          d="M 40,80 Q 20,100 45,130 L 75,130 L 65,80 Z"
          fill="#1c0f01"
          filter={`url(#${id("ragged-edge")})`}
        />
        <path
          d="M 560,80 Q 580,100 555,130 L 525,130 L 535,80 Z"
          fill="#1c0f01"
          filter={`url(#${id("ragged-edge")})`}
        />
        <path
          d="M 40,80 Q 50,65 75,70 L 525,70 Q 550,65 560,80 Q 570,110 555,130 L 45,130 Q 30,110 40,80 Z"
          fill={`url(#${id("top-roll-light")})`}
          filter={`url(#${id("paper-texture")})`}
        />
        <path
          d="M 44,95 Q 300,90 556,95"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.3"
          style={{ filter: "blur(1px)" }}
        />
      </g>

      <g filter={`url(#${id("roll-shadow")})`}>
        <path
          d="M 45,620 Q 20,650 40,670 L 65,670 L 75,620 Z"
          fill="#1c0f01"
          filter={`url(#${id("ragged-edge")})`}
        />
        <path
          d="M 555,620 Q 580,650 560,670 L 535,670 L 525,620 Z"
          fill="#1c0f01"
          filter={`url(#${id("ragged-edge")})`}
        />
        <path
          d="M 45,620 L 555,620 Q 570,640 560,670 Q 550,685 525,680 L 75,680 Q 50,685 40,670 Q 30,640 45,620 Z"
          fill={`url(#${id("bottom-roll-light")})`}
          filter={`url(#${id("paper-texture")})`}
        />
        <path
          d="M 42,660 Q 300,665 558,660"
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          opacity="0.5"
          style={{ filter: "blur(1px)" }}
        />
      </g>
    </svg>
  );
}
