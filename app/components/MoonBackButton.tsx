"use client";
import { useRouter } from "next/navigation";
import { siteText } from "@/lib/content";

export default function MoonBackButton({ className }: { className?: string }) {
  const router = useRouter();
  const backLabel = siteText.buttonTwo.trim() || "Back To Flowers";

  function handleClick() {
    // Fly rocket off to the right
    const rocket = document.querySelector<HTMLElement>(".rocket-flight");
    if (rocket) rocket.classList.add("exiting-right");

    const moonWrap = document.querySelector<HTMLElement>(".moon-wrap--journey");
    if (moonWrap) moonWrap.classList.add("returning");

    const moonText = document.querySelector<HTMLElement>(".moon-text");
    if (moonText) moonText.classList.add("fading-out");

    const navigate = () => {
      router.push("/");
    };

    setTimeout(navigate, 3800);
  }

  return (
    <button className={className} onClick={handleClick}>
      {backLabel}
    </button>
  );
}
