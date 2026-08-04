import Image from "next/image";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { stationaryRealRequestsContent } from "@/content/stationary";
import styles from "./StationaryRealRequestsSection.module.css";

export function StationaryRealRequestsSection() {
  const { headline, body, image } = stationaryRealRequestsContent;

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="stationary-real-requests-title"
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.imageWrap}>
          <Image
            src={image.src}
            alt={image.alt}
            className={styles.image}
            width={800}
            height={800}
            sizes="(max-width: 768px) 100vw, 45vw"
            quality={90}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className={styles.content}>
          <h2 id="stationary-real-requests-title" className={styles.headline}>
            {headline}
          </h2>
          <p className={styles.body}>{body}</p>
        </div>
      </div>
    </RevealOnScroll>
  );
}
