import Image from "next/image";
import type { StaticImageData } from "next/image";

import portraitOne from "../../../public/assets/home/portrait_-900-x-1200px/p1.jpg";
import portraitTwo from "../../../public/assets/home/portrait_-900-x-1200px/p2.jpg";
import arrowGraphic from "../../../public/assets/home/arrow-green.png";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./TheLagomWaySection.module.css";

const whoWeAreParagraphs = [
  "Studio Lagom is a branding-focused design studio crafting refined identities, considered packaging, and thoughtful digital experiences.",
  "We work with founders and businesses who value clarity, intention, and design that feels aligned rather than loud.",
  "Every project is approached with structure, sensitivity, and attention to detail.",
];

const whyLagomParagraphs = [
  "Lagom is a Swedish philosophy meaning 'just the right amount.'",
  "It reflects how we approach design — balanced, intentional, and free from excess.",
  "We believe the strongest brands are not the loudest, but the most aligned.",
];

type PortraitFrameProps = {
  src: StaticImageData;
  alt: string;
};

function PortraitFrame({ src, alt }: PortraitFrameProps) {
  return (
    <div className={styles.portraitWrap}>
      <div className={styles.portraitCard} aria-hidden="true" />
      <Image
        src={src}
        alt={alt}
        width={900}
        height={1200}
        className={`image ${styles.portraitImage}`}
        sizes="(min-width: 993px) 11vw, (min-width: 769px) 20vw, min(160px, 50vw)"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

type ContentBlockProps = {
  heading: string;
  paragraphs: string[];
  headingId: string;
};

function ContentBlock({ heading, paragraphs, headingId }: ContentBlockProps) {
  return (
    <div className={styles.textBlock}>
      <h2 id={headingId} className={styles.subheading}>
        {heading}
      </h2>
      <div className={styles.paragraphs}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className={`body ${styles.paragraph}`}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export function TheLagomWaySection() {
  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="the-lagom-way-title"
    >
      <div className="container">
        <h2
          id="the-lagom-way-title"
          className={`heading-section ${styles.heading}`}
        >
          THE LAGOM WAY
        </h2>

        <div className={styles.content}>
          <div className={styles.row}>
            <div className={styles.imageCol}>
              <PortraitFrame
                src={portraitOne}
                alt="Hands arranging color swatches and design materials at a studio desk"
              />
            </div>
            <div className={styles.textCol}>
              <ContentBlock
                heading="Who we are?"
                paragraphs={whoWeAreParagraphs}
                headingId="who-we-are-heading"
              />
            </div>
          </div>

          <RevealOnScroll
            as="div"
            className={styles.arrowWrap}
            aria-hidden="true"
          >
            <Image
              src={arrowGraphic}
              alt=""
              width={820}
              height={525}
              className={styles.arrow}
              loading="lazy"
              decoding="async"
            />
          </RevealOnScroll>

          <div className={`${styles.row} ${styles.rowMirrored}`}>
            <div className={styles.textCol}>
              <ContentBlock
                heading="Why Lagom Design?"
                paragraphs={whyLagomParagraphs}
                headingId="why-lagom-heading"
              />
            </div>
            <div className={styles.imageCol}>
              <PortraitFrame
                src={portraitTwo}
                alt="A laptop displayed on a minimal concrete pedestal"
              />
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
