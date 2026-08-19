import Image from "next/image";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./ClientWorkGallery.module.css";

type GalleryImage = {
  id: string;
  imageUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export function ClientWorkGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className={styles.gallery} aria-label="Project gallery">
      {images.map((image, index) => (
        <RevealOnScroll
          as="div"
          key={image.id}
          className={styles.item}
          delay={index * 100}
        >
          {image.width && image.height ? (
            <Image
              src={image.imageUrl}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="100vw"
              loading="lazy"
              decoding="async"
              className={styles.image}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.imageUrl}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className={styles.image}
            />
          )}
        </RevealOnScroll>
      ))}
    </section>
  );
}
