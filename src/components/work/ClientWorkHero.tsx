import Image from "next/image";
import styles from "./ClientWorkHero.module.css";

type ClientWorkHeroProps = {
  src: string;
  alt: string;
  title: string;
};

export function ClientWorkHero({ src, alt, title }: ClientWorkHeroProps) {
  return (
    <section className={styles.hero} aria-label={title}>
      <h1 className="sr-only">{title}</h1>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className={styles.image}
      />
    </section>
  );
}
