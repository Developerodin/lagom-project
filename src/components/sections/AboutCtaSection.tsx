import Link from "next/link";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  aboutCtaCollageColumns,
  aboutCtaCollageItems,
  aboutCtaContent,
} from "@/content/about";
import styles from "./AboutCtaSection.module.css";

const collageItemsById = Object.fromEntries(
  aboutCtaCollageItems.map((item) => [item.id, item]),
);

export function AboutCtaSection() {
  const { headline, cta } = aboutCtaContent;

  const renderLine = (
    segments: ReadonlyArray<{ text: string; emphasis: boolean }>,
    key: string,
    className?: string,
  ) => (
    <span key={key} className={`${styles.line} ${className ?? ""}`.trim()}>
      {segments.map((segment) =>
        segment.emphasis ? (
          <strong key={segment.text} className={styles.emphasis}>
            {segment.text}
          </strong>
        ) : (
          <span key={segment.text}>{segment.text}</span>
        ),
      )}
    </span>
  );

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="about-cta-title"
    >
      <div className={styles.layout}>
        <div className={styles.collageCol} aria-hidden="true">
          <div className={styles.collage}>
            {aboutCtaCollageColumns.map((column) => (
              <div
                key={column.id}
                className={`${styles.collageColumn} ${
                  column.wide ? styles.collageColumnWide : ""
                }`.trim()}
              >
                {Array.from({ length: column.leadingEmptySlots ?? 0 }).map(
                  (_, index) => (
                    <div
                      key={`${column.id}-spacer-${index}`}
                      className={styles.collageSpacer}
                      aria-hidden="true"
                    />
                  ),
                )}
                {column.itemIds.map((itemId) => {
                  const item = collageItemsById[itemId];
                  const isSaveur = item.id === "b3";

                  return (
                    <div
                      key={item.id}
                      className={`${styles.collageItem} ${
                        isSaveur ? styles.collageItemSaveur : ""
                      }`.trim()}
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className={`${styles.collageImage} ${
                          isSaveur ? styles.collageImageSaveur : ""
                        }`.trim()}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.contentCol}>
          <h3 id="about-cta-title" className={styles.headline}>
            {renderLine(headline.line1, "line1", styles.lineFirst)}
            {renderLine(headline.line2, "line2")}
          </h3>

          <Link href={cta.href} className="button button-primary">
            {cta.label}
          </Link>
        </div>
      </div>
    </RevealOnScroll>
  );
}
