import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getPublishedClients } from "@/lib/work";
import styles from "./FeaturedWorkSection.module.css";

const FEATURED_LIMIT = 6;

export async function FeaturedWorkSection() {
  let items: Awaited<ReturnType<typeof getPublishedClients>> = [];
  try {
    items = await getPublishedClients(FEATURED_LIMIT);
  } catch {
    items = [];
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="featured-work-title"
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.layout}>
          <h2
            id="featured-work-title"
            className={`heading-section ${styles.heading}`}
          >
            Featured Work
          </h2>

          <div className={styles.gridWrap}>
            <ul className={styles.grid}>
              {items.map((item) => (
                <li key={item.slug}>
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
                        sizes="(min-width: 993px) 33vw, 50vw"
                        className={styles.image}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.ctaWrap}>
            <Link href="/work" className="button button-primary">
              View All Work
            </Link>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
