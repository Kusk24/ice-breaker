"use client";
import { useEffect, useRef, useState } from "react";

const isProd = process.env.NODE_ENV === "production";
const src = `${isProd ? "/ice-breaker" : ""}/music/Love Story (Piano).mp3`;
const MUSIC_OFF_KEY = "t3-music-off";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    // If user previously turned music off, don't auto-play
    if (localStorage.getItem(MUSIC_OFF_KEY) === "1") return;

    // Start on first user click (e.g. the "Click Here" button)
    function onFirstClick() {
      audio.muted = true;
      audio.play().then(() => {
        audio.muted = false;
        setPlaying(true);
      }).catch(() => {});
      window.removeEventListener("click", onFirstClick);
    }
    window.addEventListener("click", onFirstClick);

    return () => {
      window.removeEventListener("click", onFirstClick);
      audio.pause();
      audio.src = "";
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      localStorage.setItem(MUSIC_OFF_KEY, "1");
    } else {
      audio.play().then(() => {
        setPlaying(true);
        localStorage.removeItem(MUSIC_OFF_KEY);
      }).catch(() => {});
    }
  }

  return (
    <button
      onClick={toggle}
      className="music-toggle"
      aria-label={playing ? "Pause music" : "Play music"}
      title={playing ? "Pause music" : "Play music"}
    >
      <span className={`music-toggle__icon${playing ? " music-toggle__icon--on" : " music-toggle__icon--off"}`}>♪</span>
      <span className="music-toggle__label">{playing ? "Music on" : "Music off"}</span>
    </button>
  );
}
