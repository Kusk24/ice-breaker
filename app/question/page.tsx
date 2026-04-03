import type { CSSProperties } from "react";

const stars = Array.from({ length: 50 }, (_, i) => ({
  x: (i * 23) % 100,
  y: (i * 37) % 92,
  delay: `${(i % 7) * 0.6}s`,
}));

export default function QuestionPage() {
  return (
    <main className="scene question-scene" aria-label="Question page">
      <div className="sky" aria-hidden>
        {stars.map((star, i) => (
          <span
            key={i}
            className="star"
            style={{ "--x": star.x, "--y": star.y, "--delay": star.delay } as CSSProperties}
          />
        ))}
      </div>

      <div className="question-content">
        <p className="question-debris" aria-hidden>
          {["🔴", "🟡", "⚪", "🔵", "🔴", "🟡", "⚪"].map((emoji, i) => (
            <span key={i} className="debris-piece" style={{ "--di": i } as CSSProperties}>
              {emoji}
            </span>
          ))}
        </p>

        <h1 className="question-title">
          {"Will you go to the moon & back with me?".split("").map((ch, i) => (
            <span key={i} className="question-char" style={{ "--qi": i } as CSSProperties}>
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <div className="question-choices">
          <button className="q-btn q-btn--yes">Yes 💖</button>
          <button className="q-btn q-btn--no">No 🥺</button>
        </div>
      </div>
    </main>
  );
}
