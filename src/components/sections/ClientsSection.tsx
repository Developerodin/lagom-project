import fs from "node:fs";
import path from "node:path";

import Image from "next/image";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./ClientsSection.module.css";

const CLIENTS_DIR = path.join(process.cwd(), "public/assets/home/Clients");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

type ClientLogo = {
  id: string;
  src: string;
  alt: string;
};

function formatLogoAlt(filename: string): string {
  const baseName = path.basename(filename, path.extname(filename));

  return `${baseName.replace(/[-_]+/g, " ").trim()} logo`;
}

function getClientLogos(): ClientLogo[] {
  if (!fs.existsSync(CLIENTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CLIENTS_DIR)
    .filter((file) => {
      const extension = path.extname(file).toLowerCase();

      return IMAGE_EXTENSIONS.has(extension) && !file.startsWith(".");
    })
    .sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: "base" }),
    )
    .map((file) => ({
      id: file,
      src: `/assets/home/Clients/${encodeURIComponent(file)}`,
      alt: formatLogoAlt(file),
    }));
}

type LogoMarqueeGroupProps = {
  logos: ClientLogo[];
  ariaHidden?: boolean;
};

function LogoMarqueeGroup({ logos, ariaHidden = false }: LogoMarqueeGroupProps) {
  return (
    <ul className={styles.marqueeGroup} aria-hidden={ariaHidden || undefined}>
      {logos.map((logo) => (
        <li
          key={ariaHidden ? `${logo.id}-duplicate` : logo.id}
          className={styles.logoItem}
        >
          <Image
            src={logo.src}
            alt={ariaHidden ? "" : logo.alt}
            width={150}
            height={150}
            className={styles.logoImage}
            sizes="(max-width: 480px) 73px, (max-width: 768px) 94px, 160px"
            loading="eager"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
}

type ClientMarqueeProps = {
  logos: ClientLogo[];
  reverse?: boolean;
};

function ClientMarquee({ logos, reverse = false }: ClientMarqueeProps) {
  if (logos.length === 0) {
    return null;
  }

  const trackClassName = reverse
    ? `${styles.marqueeTrack} ${styles.marqueeTrackReverse}`
    : styles.marqueeTrack;

  return (
    <div className={styles.marqueeViewport}>
      <div className={trackClassName}>
        <LogoMarqueeGroup logos={logos} />
        <LogoMarqueeGroup logos={logos} ariaHidden />
      </div>
    </div>
  );
}

export function ClientsSection() {
  const logos = getClientLogos();
  const midpoint = Math.ceil(logos.length / 2);
  const firstStripLogos = logos.slice(0, midpoint);
  const secondStripLogos = logos.slice(midpoint);

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="clients-section-title"
    >
      <div className={`container ${styles.headingWrap}`}>
        <h2
          id="clients-section-title"
          className={`heading-section ${styles.heading}`}
        >
          CLIENTS WE HAVE WORKED WITH
        </h2>
      </div>

      {logos.length > 0 ? (
        <div className={styles.marqueeStrips}>
          <ClientMarquee logos={firstStripLogos} />
          <ClientMarquee logos={secondStripLogos} reverse />
        </div>
      ) : null}
    </RevealOnScroll>
  );
}
