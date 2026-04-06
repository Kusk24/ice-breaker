"use client";
import { useState } from "react";
import { letter } from "@/lib/letter";

export default function ScrollLetter() {
  const [open, setOpen] = useState(false);

  const lines = letter.split("\n");

  return (
    <>
      {/* Hidden SVG defs — wavy clip path used by the modal body */}
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
        <svg viewBox="0 0 64 104" xmlns="http://www.w3.org/2000/svg" className="scroll-mini-svg">
          <defs>
            <linearGradient id="mini-paper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#e6cd9a"/>
              <stop offset="50%"  stopColor="#d2b478"/>
              <stop offset="100%" stopColor="#b8985e"/>
            </linearGradient>
            <linearGradient id="mini-roll" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3a2008"/>
              <stop offset="18%"  stopColor="#8a5a22"/>
              <stop offset="42%"  stopColor="#c89858"/>
              <stop offset="52%"  stopColor="#d8a868"/>
              <stop offset="62%"  stopColor="#b88248"/>
              <stop offset="82%"  stopColor="#6a4218"/>
              <stop offset="100%" stopColor="#2a1604"/>
            </linearGradient>
            <radialGradient id="mini-coil" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#1a0c00"/>
              <stop offset="60%"  stopColor="#3a2008"/>
              <stop offset="100%" stopColor="#5a3618"/>
            </radialGradient>
          </defs>

          {/* parchment body — subtly wavy sides via cubic curves */}
          <path d="
            M 13 18
            C 10 32, 14 46, 11 60
            C 14 74, 10 86, 13 90
            L 51 90
            C 54 86, 50 74, 53 60
            C 50 46, 54 32, 51 18
            Z
          " fill="url(#mini-paper)"/>

          {/* left/right concave shading */}
          <path d="
            M 13 18
            C 10 32, 14 46, 11 60
            C 14 74, 10 86, 13 90
            L 17 88
            L 16 22
            Z
          " fill="rgba(70,42,12,0.22)"/>
          <path d="
            M 51 18
            C 54 32, 50 46, 53 60
            C 50 74, 54 86, 51 90
            L 47 88
            L 48 22
            Z
          " fill="rgba(70,42,12,0.22)"/>

          {/* shadow under top roll where it meets paper */}
          <ellipse cx="32" cy="22" rx="20" ry="2" fill="rgba(0,0,0,0.18)"/>

          {/* top roll cylinder */}
          <ellipse cx="32" cy="14" rx="30" ry="11" fill="url(#mini-roll)"/>
          {/* coil ends */}
          <ellipse cx="3"  cy="14" rx="3.2" ry="9" fill="url(#mini-coil)"/>
          <ellipse cx="61" cy="14" rx="3.2" ry="9" fill="url(#mini-coil)"/>

          {/* shadow above bottom roll */}
          <ellipse cx="32" cy="86" rx="20" ry="2" fill="rgba(0,0,0,0.14)"/>

          {/* bottom roll cylinder */}
          <ellipse cx="32" cy="92" rx="30" ry="11" fill="url(#mini-roll)"/>
          <ellipse cx="3"  cy="92" rx="3.2" ry="9" fill="url(#mini-coil)"/>
          <ellipse cx="61" cy="92" rx="3.2" ry="9" fill="url(#mini-coil)"/>

          {/* writing lines */}
          <line x1="19" y1="38" x2="45" y2="38" stroke="rgba(80,48,12,0.45)" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="19" y1="50" x2="45" y2="50" stroke="rgba(80,48,12,0.45)" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="19" y1="62" x2="38" y2="62" stroke="rgba(80,48,12,0.45)" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="scroll-overlay" onClick={() => setOpen(false)}>
          <div className="scroll-modal" onClick={e => e.stopPropagation()}>
            {/* Top roll */}
            <div className="scroll-roll scroll-roll--top">
              <svg className="scroll-roll__svg" viewBox="0 0 480 60" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="roll-grad-top" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3a2008"/>
                    <stop offset="18%"  stopColor="#8a5a22"/>
                    <stop offset="42%"  stopColor="#c89858"/>
                    <stop offset="52%"  stopColor="#dcae6c"/>
                    <stop offset="62%"  stopColor="#b88248"/>
                    <stop offset="82%"  stopColor="#6a4218"/>
                    <stop offset="100%" stopColor="#2a1604"/>
                  </linearGradient>
                </defs>
                <ellipse cx="240" cy="30" rx="240" ry="28" fill="url(#roll-grad-top)"/>
              </svg>
              <span className="scroll-roll__coil scroll-roll__coil--left"/>
              <span className="scroll-roll__coil scroll-roll__coil--right"/>
            </div>

            {/* Parchment body — wavy edges via clip-path */}
            <div className="scroll-modal__inner">
              <div className="scroll-modal__body">
                {lines.map((line, i) => (
                  line === "" ? (
                    <br key={i} />
                  ) : (
                    <p
                      key={i}
                      className="scroll-modal__line"
                      style={{ "--li": i } as React.CSSProperties}
                    >
                      {line}
                    </p>
                  )
                ))}
              </div>
            </div>

            {/* Bottom roll */}
            <div className="scroll-roll scroll-roll--bottom">
              <svg className="scroll-roll__svg" viewBox="0 0 480 60" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="roll-grad-bot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3a2008"/>
                    <stop offset="18%"  stopColor="#8a5a22"/>
                    <stop offset="42%"  stopColor="#c89858"/>
                    <stop offset="52%"  stopColor="#dcae6c"/>
                    <stop offset="62%"  stopColor="#b88248"/>
                    <stop offset="82%"  stopColor="#6a4218"/>
                    <stop offset="100%" stopColor="#2a1604"/>
                  </linearGradient>
                </defs>
                <ellipse cx="240" cy="30" rx="240" ry="28" fill="url(#roll-grad-bot)"/>
              </svg>
              <span className="scroll-roll__coil scroll-roll__coil--left"/>
              <span className="scroll-roll__coil scroll-roll__coil--right"/>
            </div>

            <button className="scroll-modal__close" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}
