import Image from "next/image";

import {
  slidingImagesContent,
  type SlidingImageItem,
} from "@/content/home";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

import styles from "./SlidingImagesSection.module.css";

type ImageMarqueeGroupProps = {
  images: readonly SlidingImageItem[];
  ariaHidden?: boolean;
};

function ImageMarqueeGroup({
  images,
  ariaHidden = false,
}: ImageMarqueeGroupProps) {
  return (
    <ul className={styles.marqueeGroup} aria-hidden={ariaHidden || undefined}>
      {images.map((item) => (
        <li
          key={ariaHidden ? `${item.id}-duplicate` : item.id}
          className={styles.card}
        >
          <Image
            src={item.src}
            alt={ariaHidden ? "" : item.alt}
            width={1750}
            height={851}
            className={styles.cardImage}
            sizes="(max-width: 640px) 260px, (max-width: 992px) 360px, 480px"
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
}

type ImageMarqueeProps = {
  images: readonly SlidingImageItem[];
  reverse?: boolean;
};

function ImageMarquee({ images, reverse = false }: ImageMarqueeProps) {
  if (images.length === 0) {
    return null;
  }

  const trackClassName = reverse
    ? `${styles.marqueeTrack} ${styles.marqueeTrackReverse}`
    : styles.marqueeTrack;

  return (
    <div className={styles.marqueeViewport}>
      <div className={trackClassName}>
        <ImageMarqueeGroup images={images} />
        <ImageMarqueeGroup images={images} ariaHidden />
      </div>
    </div>
  );
}

export function SlidingImagesSection() {
  const { rowOne, rowTwo } = slidingImagesContent;

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-label="Project image gallery"
    >
      <div className={styles.marqueeStrips}>
        <ImageMarquee images={rowOne} />
        <ImageMarquee images={rowTwo} reverse />
      </div>
    </RevealOnScroll>
  );
}
