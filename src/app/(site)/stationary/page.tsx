import type { Metadata } from "next";

import styles from "./stationary.module.css";

export const metadata: Metadata = {
  title: "Stationary",
  description:
    "Lagom Design stationary — thoughtful print pieces for considered brands. Coming soon.",
};

const title = "Coming Soon";

export default function StationaryPage() {
  return (
    <section className={styles.page} aria-label="Stationary">
      <div className={styles.backdrop} aria-hidden="true">
        <span className={`${styles.sheet} ${styles.sheetOne}`} />
        <span className={`${styles.sheet} ${styles.sheetTwo}`} />
        <span className={`${styles.sheet} ${styles.sheetThree}`} />
      </div>

      <div className={styles.hanger}>
        <span className={styles.ropeLeft} aria-hidden="true" />
        <span className={styles.ropeRight} aria-hidden="true" />

        <div className={styles.banner}>
          <span className={styles.seal} aria-hidden="true">
            <span className={styles.sealInner}>L</span>
          </span>

          <p className={styles.eyebrow}>Stationary</p>

          <h1 className={styles.title}>
            {title.split("").map((char, index) => (
              <span
                key={`${char}-${index}`}
                className={styles.letter}
                style={{ animationDelay: `${0.75 + index * 0.055}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          <p className={styles.subtitle}>
            Thoughtful print pieces — almost ready to unfold.
          </p>
        </div>
      </div>
    </section>
  );
}
