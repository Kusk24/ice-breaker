"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "onClick">;

export default function TransitionLink({ href, children, ...rest }: Props) {
  const router = useRouter();
  let navigated = false;

  function navigate() {
    if (navigated) return;
    navigated = true;
    router.push(href as string);
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    navigate();
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLAnchorElement>) {
    e.preventDefault();
    navigate();
  }

  return (
    <Link href={href} {...rest} onClick={handleClick} onTouchEnd={handleTouchEnd}>
      {children}
    </Link>
  );
}
