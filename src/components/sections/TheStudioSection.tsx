import Image from "next/image";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  theStudioSectionContent,
  type TheStudioTextSegment,
} from "@/content/about";
import styles from "./TheStudioSection.module.css";

function paragraphKey(
  paragraph: string | ReadonlyArray<TheStudioTextSegment>,
): string {
  return typeof paragraph === "string"
    ? paragraph
    : paragraph.map((segment) => segment.text).join("");
}

function renderParagraph(
  paragraph: string | ReadonlyArray<TheStudioTextSegment>,
) {
  if (typeof paragraph === "string") {
    return paragraph;
  }

  return paragraph.map((segment) =>
    segment.emphasis ? (
      <strong key={segment.text} className={styles.emphasis}>
        {segment.text}
      </strong>
    ) : (
      <span key={segment.text}>{segment.text}</span>
    ),
  );
}

export function TheStudioSection() {
  const { title, paragraphs, image } = theStudioSectionContent;

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="the-studio-title"
    >
      <div className="container">
        <div className={styles.layout}>
          <header className={styles.header}>
            <h2 id="the-studio-title" className={styles.title}>
              <span className={styles.titleLine}>{title.line1}</span>
              <span className={styles.titleLine}>{title.line2}</span>
            </h2>
            <div className={styles.divider} aria-hidden="true" />
          </header>

          <div className={styles.body}>
            <div className={styles.imageCol}>
              <div className={styles.imageWrap}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 993px) 34vw, (min-width: 769px) 42vw, 88vw"
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </div>
            </div>

            <div className={styles.textCol}>
              <div className={styles.paragraphs}>
                {paragraphs.map((paragraph) => (
                  <p
                    key={paragraphKey(paragraph)}
                    className={`body ${styles.paragraph}`}
                  >
                    {renderParagraph(paragraph)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
