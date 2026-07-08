"use client";

import { useEffect, useRef, useState } from "react";

import { brandStatementContent } from "@/content/home";
import { RevealText } from "@/components/ui/RevealText";
import styles from "./BrandStatementSection.module.css";

function scheduleStateUpdate(fn: () => void) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    window.setTimeout(fn, 0);
  }
}

type BrandStatementSectionProps = {
  loraTitle?: boolean;
  variant?: "default" | "inverted";
};

export function BrandStatementSection({
  loraTitle = false,
  variant = "default",
}: BrandStatementSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      scheduleStateUpdate(() => setIsActive(true));
      return;
    }

    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${variant === "inverted" ? styles.sectionInverted : ""}`}
      aria-labelledby="brand-statement-title"
      data-revealed={isActive ? "true" : undefined}
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <RevealText
            mode="words"
            variant="expressive"
            active={isActive}
            as="h1"
            id="brand-statement-title"
            segments={brandStatementContent.headline}
            className={`${styles.headline} ${loraTitle ? styles.headlineLora : ""}`}
            emphasisClassName={styles.emphasis}
            staggerMs={62}
          />

          <RevealText
            mode="lines"
            variant="expressive"
            active={isActive}
            lines={brandStatementContent.taglines}
            className={styles.taglines}
            lineClassName={styles.tagline}
            delayMs={1100}
            staggerMs={22}
          />
        </div>
      </div>
    </section>
  );
}
