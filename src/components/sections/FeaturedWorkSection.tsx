import Image from "next/image";
import Link from "next/link";
import { featuredWorkItems } from "@/content/home";
import styles from "./FeaturedWorkSection.module.css";

export function FeaturedWorkSection() {
  return (
    <section className={styles.section} aria-labelledby="featured-work-title">
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
              {featuredWorkItems.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/work/${item.slug}`}
                    className={styles.card}
                    aria-label={`View ${item.title} project`}
                  >
                    <div className={styles.cardMedia}>
                      <Image
                        src={item.image}
                        alt={item.alt}
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
            <Link
              href="/work"
              className="button button-primary"
            >
              View All Work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
