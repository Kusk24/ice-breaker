"use client";
import { useRouter } from "next/navigation";

export default function ConstellationBack() {
  const router = useRouter();

  function handleBack() {
    router.push("/moon");
  }

  return (
    <button type="button" className="constellation-back hero__btn" onClick={handleBack}>
      Back To Moon
    </button>
  );
}
