"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { siteText } from "@/lib/content";
import { preloadImages } from "@/lib/preload";

const isProd = process.env.NODE_ENV === "production";
const base = isProd ? "/ice-breaker" : "";

const PHOTOS = ["20.JPG", "21.JPG", "22.JPG", "23.JPG", "24.JPG"];

const stars = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 19) % 100,
  y: (i * 31) % 95,
  delay: `${(i % 8) * 0.5}s`,
}));

const confetti = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 13) % 100,
  color: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6BD6", "#FF9F43", "#A29BFE"][i % 7],
  delay: `${((i * 0.09) % 2.4).toFixed(2)}s`,
  duration: `${(2.8 + (i % 5) * 0.35).toFixed(2)}s`,
  size: 6 + (i % 5) * 3,
  spin: i % 2 === 0 ? 540 : -360,
}));

export default function CelebratePage() {
  useEffect(() => {
    preloadImages(PHOTOS.map((f) => `${base}/reactions/${f}`));
  }, []);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleRate() {
    if (!rating) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${siteText.receiverEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            Rating: `${rating} / 5`,
            Feedback: feedback || "(no message)",
            _subject: `T3 rated the walk-thru ${rating}/5 ⭐`,
          }),
        }
      );
      const data = await res.json();
      if (data.success === "true" || data.success === true) {
        setSent(true);
      } else {
        setError("Something went wrong — please try again.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="scene celebrate-scene">
      {/* Night sky */}
      <div className="sky" aria-hidden>
        {stars.map((s, i) => (
          <span key={i} className="star"
            style={{ "--x": s.x, "--y": s.y, "--delay": s.delay } as CSSProperties}
          />
        ))}
      </div>

      {/* Falling confetti */}
      <div className="celebrate-confetti" aria-hidden>
        {confetti.map((c, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                "--cx": c.x,
                "--cc": c.color,
                "--cd": c.delay,
                "--cdu": c.duration,
                "--cs": `${c.size}px`,
                "--spin": `${c.spin}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Photo burst */}
      <div className="celebrate-photos">
        {PHOTOS.map((file, i) => (
          <div
            key={file}
            className="celebrate-photo"
            style={{ "--pi": i } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${base}/reactions/${file}`} alt="" />
          </div>
        ))}
      </div>

      {/* Rating + GitHub */}
      <div className="celebrate-form-wrap">
        <div className="celebrate-form celebrate-rating-card">
          <h2 className="celebrate-form__title">
            Hope you enjoyed this T3 universe walk-thru ✨
          </h2>
          <p className="celebrate-rating__prompt">How would you rate it?</p>
          <div
            className="celebrate-rating__stars"
            onMouseLeave={() => setHover(0)}
            role="radiogroup"
            aria-label="Rate this experience"
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  className={`celebrate-rating__star${active ? " is-active" : ""}`}
                  onMouseEnter={() => setHover(n)}
                  onFocus={() => setHover(n)}
                  onBlur={() => setHover(0)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  aria-checked={rating === n}
                  role="radio"
                >
                  ★
                </button>
              );
            })}
          </div>
          {sent ? (
            <p className="celebrate-rating__thanks">
              Sent! 💬 Thank youuu 🥳
            </p>
          ) : (
            <>
              <textarea
                className="celebrate-input celebrate-feedback"
                placeholder="Any feedback? (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
              {error && <p className="celebrate-error">{error}</p>}
              <button
                type="button"
                className="celebrate-submit"
                onClick={handleRate}
                disabled={sending || rating === 0}
              >
                {sending ? "Sending…" : "Rate 💬"}
              </button>
            </>
          )}

          <a
            href="https://github.com/Kusk24/ice-breaker"
            target="_blank"
            rel="noreferrer noopener"
            className="celebrate-github"
          >
            <span aria-hidden>⭐</span>
            <span>Take a look on GitHub</span>
          </a>
        </div>
      </div>

      {/* Navigation buttons */}
      <nav className="celebrate-nav" aria-label="Revisit a page">
        <p className="celebrate-nav__prompt">Wanna revisit somewhere? ✨</p>
        <div className="celebrate-nav__list">
          <Link href="/" className="celebrate-nav__btn">🌹 Back to the flowers</Link>
          <Link href="/moon" className="celebrate-nav__btn">🌕 Visit the moon</Link>
          <Link href="/constellation" className="celebrate-nav__btn">✨ Collect the stars</Link>
          <Link href="/countdown" className="celebrate-nav__btn">🕳️ Into the black hole</Link>
          <Link href="/question" className="celebrate-nav__btn">💭 Through the multiverse veil</Link>
        </div>
      </nav>
    </main>
  );
}
