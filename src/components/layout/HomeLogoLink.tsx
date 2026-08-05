"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";

type HomeLogoLinkProps = {
  className?: string;
  "aria-label": string;
  children: ReactNode;
};

export function HomeLogoLink({
  className,
  "aria-label": ariaLabel,
  children,
}: HomeLogoLinkProps) {
  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (window.location.pathname === "/") {
      window.location.reload();
      return;
    }
    window.location.assign("/");
  }

  return (
    <Link
      href="/"
      className={className}
      aria-label={ariaLabel}
      onClick={handleLogoClick}
    >
      {children}
    </Link>
  );
}
