"use client";
import { useRouter } from "next/navigation";

export default function ConstellationBack() {
  const router = useRouter();

  function handleBack() {
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => router.push("/moon"));
    } else {
      router.push("/moon");
    }
  }

  return (
    <button type="button" className="constellation-back hero__btn" onClick={handleBack}>
      Back To Moon
    </button>
  );
}
