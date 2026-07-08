import Image from "next/image";
import Link from "next/link";
import styles from "./WorkCard.module.css";

export type WorkCardItem = {
  slug: string;
  title: string;
  cardImage: string;
  cardAlt: string;
  whatWeDid?: string | null;
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
  const whatWeDid = item.whatWeDid?.trim() || null;

  return (
    <Link
      href={`/work/${item.slug}`}
      className={[styles.card, className].filter(Boolean).join(" ")}
      aria-label={`View ${item.title} project`}
    >
      <div className={styles.cardMedia}>
        <Image
          src={item.cardImage}
          alt={item.cardAlt}
          fill
          sizes={sizes}
          className={styles.image}
        />
        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.overlayStack}>
            <div className={styles.overlayBlock}>
              <span className={styles.overlayTitle}>{item.title}</span>
            </div>
            {whatWeDid ? (
              <div className={styles.overlayBlock}>
                <span className={styles.overlayLabel}>WHAT WE DID :</span>
                <p className={styles.overlayText}>{whatWeDid}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <span className={styles.cardTitle}>{item.title}</span>
    </Link>
  );
}
