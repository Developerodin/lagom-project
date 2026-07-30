"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/content/site";
import { Navigation } from "./Navigation";
import styles from "./Header.module.css";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    closeMenu();
    if (window.location.pathname === "/") {
      window.location.reload();
      return;
    }
    window.location.assign("/");
  }

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    // Block background scroll without overflow/position tricks that break sticky.
    function preventBackgroundScroll(event: Event) {
      const target = event.target;
      if (target instanceof Element && target.closest("#mobile-navigation")) {
        return;
      }
      event.preventDefault();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label={siteConfig.name} onClick={handleLogoClick}>
          <Image
            src="/assets/logo/lagom-design-logo-02.png"
            alt=""
            width={608}
            height={358}
            className={styles.logoImage}
            priority
          />
          <span className="sr-only">{siteConfig.name}</span>
        </Link>

        <div className={styles.desktopNav}>
          <Navigation />
        </div>

        <button
          type="button"
          className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ""}`}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileNavInner}>
          <div className="container">
            <Navigation inverted onNavigate={closeMenu} />
          </div>
        </div>
      </div>
    </header>
  );
}
