import Image from "next/image";
import Link from "next/link";
import styles from "./WorkCard.module.css";

export type WorkCardItem = {
  slug: string;
  title: string;
  cardImage: string;
  cardAlt: string;
  services?: string[];
};

type WorkCardProps = {
  item: WorkCardItem;
  sizes?: string;
  className?: string;
};

export function WorkCard({
  item,
  sizes = "(min-width: 769px) 33vw, 50vw",
  className,
}: WorkCardProps) {
  const services = (item.services ?? [])
    .map((service) => service.trim())
    .filter(Boolean);

  return (
    <Link
      href={`/work/${item.slug}`}
      className={[styles.card, className].filter(Boolean).join(" ")}
      aria-label={`View ${item.title} project`}
      data-work-card
    >
      <div className={styles.cardMedia}>
        <Image
          src={item.cardImage}
          alt={item.cardAlt}
          fill
          sizes={sizes}
          loading="lazy"
          decoding="async"
          className={styles.image}
        />
        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.overlayStack}>
            <div className={styles.overlayBlock}>
              <span className={styles.overlayTitle}>{item.title}</span>
            </div>
            {services.length > 0 ? (
              <div className={styles.overlayBlock}>
                <ul className={styles.overlayServices}>
                  {services.map((service) => (
                    <li key={service} className={styles.overlayService}>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <span className={styles.cardTitle}>{item.title}</span>
    </Link>
  );
}
