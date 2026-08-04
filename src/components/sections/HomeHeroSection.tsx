import Link from "next/link";

import { homeHeroContent } from "@/content/home";
import { HomeHeroCardsAnimation } from "./HomeHeroCardsAnimation";
import styles from "./HomeHeroSection.module.css";

export function HomeHeroSection() {
  const { headlineLead, headlineAccent, body, primaryCta, secondaryCta } =
    homeHeroContent;

  return (
    <section
      className={styles.section}
      aria-labelledby="home-hero-title"
    >
      <HomeHeroCardsAnimation />
      <div
        className={`container ${styles.inner}`}
        data-hero-content
      >
        <h1 id="home-hero-title" className={styles.headline}>
          <span className={styles.headlineLead}>{headlineLead}</span>
          <br />
          <em className={styles.headlineAccent}>{headlineAccent}</em>
        </h1>

        <p className={styles.body}>{body}</p>

        <div className={styles.actions}>
          <Link
            href={primaryCta.href}
            className="button button-primary"
          >
            {primaryCta.label} →
          </Link>
          <Link
            href={secondaryCta.href}
            className="button button-outline"
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
