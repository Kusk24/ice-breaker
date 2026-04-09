"use client";
import { useState, type CSSProperties } from "react";
import { letter } from "@/lib/letter";
import ScrollArt from "./ScrollArt";
import ScrollRoll from "./ScrollRoll";

export default function ScrollLetter() {
  const [open, setOpen] = useState(false);

  const lines = letter.split("\n");

  return (
    <>
      {/* Hidden defs — wavy clip path used by the modal parchment body */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="scrollWavyEdge" clipPathUnits="objectBoundingBox">
            <path d="
              M 0.02 0
              L 0.98 0
              C 1.005 0.08, 0.985 0.16, 1.005 0.24
              C 0.985 0.32, 1.005 0.40, 0.99  0.48
              C 1.005 0.56, 0.985 0.64, 1.005 0.72
              C 0.99  0.80, 1.005 0.88, 0.985 0.96
              L 0.98 1
              L 0.02 1
              C 0.005 0.96, -0.005 0.88, 0.01 0.80
              C -0.005 0.72, 0.005 0.64, -0.005 0.56
              C 0.01 0.48, -0.005 0.40, 0.005 0.32
              C -0.005 0.24, 0.015 0.16, -0.005 0.08
              Z
            "/>
          </clipPath>
        </defs>
      </svg>

      {/* Floating mini scroll trigger */}
      <button
        className="scroll-btn"
        onClick={() => setOpen(true)}
        aria-label="Open letter"
        title="A letter for you"
      >
        <ScrollArt className="scroll-mini-svg" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="scroll-overlay" onClick={() => setOpen(false)}>
          <div className="scroll-modal" onClick={e => e.stopPropagation()}>
            <ScrollRoll position="top" className="scroll-roll scroll-roll--top" />

            <div className="scroll-body">
              <div className="scroll-body__content">
                {lines.map((line, i) => (
                  line === "" ? (
                    <br key={i} />
                  ) : (
                    <p
                      key={i}
                      className="scroll-modal__line"
                      style={{ "--li": i } as CSSProperties}
                    >
                      {line}
                    </p>
                  )
                ))}
              </div>
            </div>

            <ScrollRoll position="bottom" className="scroll-roll scroll-roll--bottom" />

            <button className="scroll-modal__close" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}
