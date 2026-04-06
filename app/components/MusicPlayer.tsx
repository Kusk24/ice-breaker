"use client";
import { useEffect, useRef, useState } from "react";

const isProd = process.env.NODE_ENV === "production";
const src = `${isProd ? "/ice-breaker" : ""}/music/moonlight romance.mp3`;

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    // Try autoplay immediately; fall back to first interaction if browser blocks it
    audio.play()
      .then(() => { setPlaying(true); setStarted(true); })
      .catch(() => {
        // Browser blocked autoplay — start on first user interaction
        function onFirstInteraction() {
          audio.play().then(() => { setPlaying(true); setStarted(true); }).catch(() => {});
          window.removeEventListener("click", onFirstInteraction);
          window.removeEventListener("keydown", onFirstInteraction);
          window.removeEventListener("touchstart", onFirstInteraction);
        }
        window.addEventListener("click", onFirstInteraction);
        window.addEventListener("keydown", onFirstInteraction);
        window.addEventListener("touchstart", onFirstInteraction);
      });

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <button
      onClick={toggle}
      className="music-toggle"
      aria-label={playing ? "Pause music" : "Play music"}
      title={playing ? "Pause music" : "Play music"}
    >
      {playing ? (
        // Music note animated
        <span className="music-toggle__icon music-toggle__icon--on">♪</span>
      ) : (
        <span className="music-toggle__icon music-toggle__icon--off">♪</span>
      )}
      <span className="music-toggle__label">{playing ? "Music on" : "Music off"}</span>
    </button>
  );
}
