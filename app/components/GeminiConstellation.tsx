import type { CSSProperties } from "react";

const stars: Array<[number, number]> = [
  [110, 80],
  [160, 90],
  [220, 115],
  [280, 140],
  [330, 130],
  [85, 130],
  [95, 180],
  [155, 210],
  [200, 225],
  [270, 250],
  [282, 195],
  [240, 310],
];

const lines = [
  "M110,80 L160,90 L220,115 L280,140 L330,130",
  "M110,80 L85,130 L95,180 L155,210 L200,225 L270,250",
  "M280,140 L282,195 L270,250 L240,310",
];

export default function GeminiConstellation() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 480"
      className="gemini-svg"
      aria-hidden
    >
      <defs>
        <filter id="gem-glow-large" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="gem-glow-medium" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id="gem-glow-small" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>

      <g className="gemini-svg__lines">
        {lines.map((d, i) => (
          <path
            key={`line-${i}`}
            className={`gemini-svg__line gemini-svg__line--${i + 1}`}
            d={d}
            pathLength={1}
          />
        ))}
      </g>

      <g className="gemini-svg__stars">
        {stars.map(([x, y], i) => (
          <g
            key={`star-${i}`}
            className="gemini-svg__star"
            transform={`translate(${x}, ${y})`}
            style={{ "--i": i } as CSSProperties}
          >
            <circle r="14" fill="#4d94ff" filter="url(#gem-glow-large)" opacity="0.65" />
            <circle r="7" fill="#8cbfff" filter="url(#gem-glow-medium)" opacity="0.85" />
            <circle r="2.5" fill="#ffffff" filter="url(#gem-glow-small)" />
            <circle r="1.5" fill="#ffffff" />
          </g>
        ))}
      </g>

      <g className="gemini-svg__symbol" transform="translate(200, 410)">
        <circle cx="0" cy="0" r="42" fill="none" stroke="#7bb4ff" strokeWidth="1.5" opacity="0.85" />
        <circle
          cx="0"
          cy="0"
          r="42"
          fill="none"
          stroke="#7bb4ff"
          strokeWidth="3"
          filter="url(#gem-glow-medium)"
          opacity="0.4"
        />

        <g stroke="#7bb4ff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M -22 -20 Q 0 -4 22 -20" />
          <path d="M -22 20 Q 0 4 22 20" />
          <line x1="-9" y1="-12" x2="-9" y2="12" />
          <line x1="9" y1="-12" x2="9" y2="12" />
        </g>

        <g
          stroke="#7bb4ff"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          filter="url(#gem-glow-medium)"
          opacity="0.4"
        >
          <path d="M -22 -20 Q 0 -4 22 -20" />
          <path d="M -22 20 Q 0 4 22 20" />
          <line x1="-9" y1="-12" x2="-9" y2="12" />
          <line x1="9" y1="-12" x2="9" y2="12" />
        </g>
      </g>
    </svg>
  );
}
