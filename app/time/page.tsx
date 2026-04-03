"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import { siteText } from "@/lib/content";

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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!date || !time) return;
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
            [siteText.formOne]: date,
            [siteText.formTwo]: time,
            _subject: "Ice Breaker 💕",
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

      {/* Form / success */}
      <div className="celebrate-form-wrap">
        {sent ? (
          <div className="celebrate-success">
            <p>Sent! 💌</p>
            <p className="celebrate-success__sub">See you soon 🌙</p>
          </div>
        ) : (
          <form className="celebrate-form" onSubmit={handleSubmit}>
            <h2 className="celebrate-form__title">{siteText.formQuestion}</h2>

            <label className="celebrate-field">
              <span className="celebrate-field__label">{siteText.formOne}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="celebrate-input"
                required
              />
            </label>

            <label className="celebrate-field">
              <span className="celebrate-field__label">{siteText.formTwo}</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="celebrate-input"
                required
              />
            </label>

            {error && <p className="celebrate-error">{error}</p>}

            <button
              type="submit"
              className="celebrate-submit"
              disabled={sending || !date || !time}
            >
              {sending ? "Sending…" : "Send 💌"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
