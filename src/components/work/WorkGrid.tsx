import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./WorkGrid.module.css";

export type WorkGridItem = {
  slug: string;
  title: string;
  cardImage: string;
  cardAlt: string;
};

export function WorkGrid({ items }: { items: WorkGridItem[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((item, index) => (
        <RevealOnScroll as="li" key={item.slug} delay={index * 80}>
          <Link
            href={`/work/${item.slug}`}
            className={styles.card}
            aria-label={`View ${item.title} project`}
          >
            <div className={styles.cardMedia}>
              <Image
                src={item.cardImage}
                alt={item.cardAlt}
                fill
                sizes="(min-width: 769px) 33vw, 50vw"
                className={styles.image}
              />
            </div>
            <span className={styles.cardTitle}>{item.title}</span>
          </Link>
        </RevealOnScroll>
      ))}
    </ul>
  );
}
