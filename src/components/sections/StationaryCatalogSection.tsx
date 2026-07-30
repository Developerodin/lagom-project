import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { stationaryCatalogContent } from "@/content/stationary";
import styles from "./StationaryCatalogSection.module.css";

export function StationaryCatalogSection() {
  const { headline, intro, categories } = stationaryCatalogContent;

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="stationary-catalog-title"
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <h2 id="stationary-catalog-title" className={styles.headline}>
            {headline}
          </h2>
          <p className={styles.introBody}>{intro}</p>
        </div>

        <ul className={styles.categories}>
          {categories.map((category) => (
            <li key={category.id} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category.title}</h3>
              <p className={styles.categoryTagline}>{category.tagline}</p>
              <ul className={styles.items}>
                {category.items.map((item) => (
                  <li key={item} className={styles.item}>
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

      </div>
    </RevealOnScroll>
  );
}
