import Image from "next/image";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { foundersDeskSectionContent } from "@/content/about";
import styles from "./FoundersDeskSection.module.css";

export function FoundersDeskSection() {
  const { title, name, paragraphs, image } = foundersDeskSectionContent;

  return (
    <RevealOnScroll
      as="section"
      className={`surface-accent section-lg ${styles.section}`}
      aria-labelledby="founders-desk-title"
    >
      <div className="container">
        <div className={styles.layout}>
          <h2 id="founders-desk-title" className={styles.title}>
            {title}
          </h2>

          <div className={styles.imageCol}>
            <div className={styles.imageWrap} aria-hidden={!image}>
              {image ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 769px) 22rem, 20rem"
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              ) : null}
            </div>
          </div>

          <div className={styles.textCol}>
            <h3 className={styles.name}>{name}</h3>
            <div className={styles.paragraphs}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className={`body ${styles.paragraph}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
