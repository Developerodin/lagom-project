"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavigation } from "@/content/site";
import styles from "./Navigation.module.css";

type NavigationProps = {
  inverted?: boolean;
  onNavigate?: () => void;
};

export function Navigation({ inverted = false, onNavigate }: NavigationProps) {
  const pathname = usePathname();

  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    event.currentTarget.blur();
  }

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <ul className={styles.list}>
        {mainNavigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const linkClass = [
            styles.link,
            inverted ? styles.linkInverted : "",
            isActive ? styles.linkActive : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={linkClass}
                onClick={handleLinkClick}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
