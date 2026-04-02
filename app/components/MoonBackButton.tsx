"use client";
import { useRouter } from "next/navigation";

export default function MoonBackButton({ className }: { className?: string }) {
  const router = useRouter();

  function handleClick() {
    const moonWrap = document.querySelector<HTMLElement>(".moon-wrap--journey");
    if (moonWrap) moonWrap.classList.add("returning");

    const moonText = document.querySelector<HTMLElement>(".moon-text");
    if (moonText) moonText.classList.add("fading-out");

    const navigate = () => {
      if (typeof document.startViewTransition === "function") {
        document.startViewTransition(() => router.push("/"));
      } else {
        router.push("/");
      }
    };

    // Wait for the return animation to finish before cross-fading pages
    setTimeout(navigate, 3800);
  }

  return (
    <button className={className} onClick={handleClick}>
      Back To Flowers
    </button>
  );
}
