"use client";
import { useId } from "react";

type Props = {
  position: "top" | "bottom";
  className?: string;
};

/**
 * A single horizontal scroll roll (top or bottom), styled to match
 * ScrollArt's lighting but compact (no heavy drop shadows) and free
 * to slot above/below a flexible HTML parchment body.
 */
export default function ScrollRoll({ position, className }: Props) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `roll-light-${position}-${uid}`;

  const isTop = position === "top";

  // Coordinates kept identical to ScrollArt so the visual language matches.
  // Crop the viewBox to just the roll area (with breathing room for the
  // horn caps that bulge out at the sides).
  const viewBox = isTop ? "20 60 560 80" : "20 615 560 80";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          {isTop ? (
            <>
              <stop offset="0%" stopColor="#261502" />
              <stop offset="15%" stopColor="#59340b" />
              <stop offset="35%" stopColor="#e6c485" />
              <stop offset="60%" stopColor="#fdf0d5" />
              <stop offset="85%" stopColor="#b07a33" />
              <stop offset="100%" stopColor="#1c0f01" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#1c0f01" />
              <stop offset="15%" stopColor="#b07a33" />
              <stop offset="40%" stopColor="#fdf0d5" />
              <stop offset="65%" stopColor="#e6c485" />
              <stop offset="85%" stopColor="#59340b" />
              <stop offset="100%" stopColor="#261502" />
            </>
          )}
        </linearGradient>
      </defs>

      {isTop ? (
        <g>
          {/* dark coil end caps */}
          <path d="M 40,80 Q 20,100 45,130 L 75,130 L 65,80 Z" fill="#1c0f01" />
          <path d="M 560,80 Q 580,100 555,130 L 525,130 L 535,80 Z" fill="#1c0f01" />
          {/* main cylinder body */}
          <path
            d="M 40,80 Q 50,65 75,70 L 525,70 Q 550,65 560,80 Q 570,110 555,130 L 45,130 Q 30,110 40,80 Z"
            fill={`url(#${gradId})`}
          />
          {/* highlight sheen */}
          <path
            d="M 44,95 Q 300,90 556,95"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.3"
          />
        </g>
      ) : (
        <g>
          <path d="M 45,620 Q 20,650 40,670 L 65,670 L 75,620 Z" fill="#1c0f01" />
          <path d="M 555,620 Q 580,650 560,670 L 535,670 L 525,620 Z" fill="#1c0f01" />
          <path
            d="M 45,620 L 555,620 Q 570,640 560,670 Q 550,685 525,680 L 75,680 Q 50,685 40,670 Q 30,640 45,620 Z"
            fill={`url(#${gradId})`}
          />
          <path
            d="M 42,660 Q 300,665 558,660"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            opacity="0.5"
          />
        </g>
      )}
    </svg>
  );
}
