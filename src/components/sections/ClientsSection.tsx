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
  width: number;
  height: number;
};

function formatLogoAlt(filename: string): string {
  const baseName = path.basename(filename, path.extname(filename));

  return `${baseName.replace(/[-_]+/g, " ").trim()} logo`;
}

function readImageDimensions(filePath: string): { width: number; height: number } {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".svg") {
    return { width: 240, height: 80 };
  }

  const buffer = fs.readFileSync(filePath);

  if (extension === ".png" && buffer.length >= 24) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if ((extension === ".jpg" || extension === ".jpeg") && buffer.length > 2) {
    let offset = 2;

    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        break;
      }

      const marker = buffer[offset + 1];
      const segmentLength = buffer.readUInt16BE(offset + 2);

      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }

      offset += 2 + segmentLength;
    }
  }

  return { width: 240, height: 80 };
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
    .map((file) => {
      const filePath = path.join(CLIENTS_DIR, file);
      const { width, height } = readImageDimensions(filePath);

      return {
        id: file,
        src: `/assets/home/Clients/${encodeURIComponent(file)}`,
        alt: formatLogoAlt(file),
        width,
        height,
      };
    });
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
            width={logo.width}
            height={logo.height}
            className={styles.logoImage}
            sizes="(max-width: 480px) 72px, (max-width: 768px) 96px, 120px"
          />
        </li>
      ))}
    </ul>
  );
}

export function ClientsSection() {
  const logos = getClientLogos();

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="clients-section-title"
    >
      <div className="container">
        <h2
          id="clients-section-title"
          className={`heading-section ${styles.heading}`}
        >
          CLIENTS WE HAVE WORKED WITH
        </h2>

        {logos.length > 0 ? (
          <div className={styles.marqueeViewport}>
            <div className={styles.marqueeTrack}>
              <LogoMarqueeGroup logos={logos} />
              <LogoMarqueeGroup logos={logos} ariaHidden />
            </div>
          </div>
        ) : null}
      </div>
    </RevealOnScroll>
  );
}
