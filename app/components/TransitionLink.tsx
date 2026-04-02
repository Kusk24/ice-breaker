"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "onClick">;

export default function TransitionLink({ href, children, ...rest }: Props) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (typeof document.startViewTransition !== "function") {
      router.push(href as string);
      return;
    }
    document.startViewTransition(() => {
      router.push(href as string);
    });
  }

  return (
    <Link href={href} {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
}
