"use client";

import { useState } from "react";
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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label={siteConfig.name}>
          <Image
            src="/assets/logo/logo.png"
            alt=""
            width={150}
            height={83}
            className={styles.logoImage}
            priority
          />
          <span className="sr-only">{siteConfig.name}</span>
        </Link>

        <div className={styles.desktopNav}>
          <Navigation inverted />
        </div>

        <button
          type="button"
          className={styles.menuToggle}
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
        <div className="container">
          <Navigation inverted onNavigate={closeMenu} />
        </div>
      </div>
    </header>
  );
}
