"use client";

import { useState } from "react";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { stationaryCollectionContent } from "@/content/stationary";
import { StationaryLaunchNotifyModal } from "@/components/sections/StationaryLaunchNotifyModal";
import styles from "./StationaryCollectionSection.module.css";

export function StationaryCollectionSection() {
  const { badge, headline, paragraphs, ctaLabel } = stationaryCollectionContent;
  const [notifyOpen, setNotifyOpen] = useState(false);

  return (
    <>
      <RevealOnScroll
        as="section"
        className={styles.section}
        aria-labelledby="stationary-collection-title"
      >
        <div className={`container ${styles.inner}`}>
          <p className={styles.badge}>{badge}</p>
          <h2 id="stationary-collection-title" className={styles.headline}>
            {headline}
          </h2>
          <div className={styles.copy}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </div>
          <button
            type="button"
            className={`button button-outline ${styles.cta}`}
            onClick={() => setNotifyOpen(true)}
          >
            {ctaLabel}
          </button>
        </div>
      </RevealOnScroll>

      <StationaryLaunchNotifyModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
    </>
  );
}
