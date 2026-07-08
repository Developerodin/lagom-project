import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { WorkCard, type WorkCardItem } from "@/components/work/WorkCard";
import styles from "./WorkGrid.module.css";

export type WorkGridItem = WorkCardItem & {
  categorySlug?: string | null;
};

export function WorkGrid({ items }: { items: WorkGridItem[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((item, index) => (
        <RevealOnScroll as="li" key={item.slug} delay={index * 80}>
          <WorkCard item={item} />
        </RevealOnScroll>
      ))}
    </ul>
  );
}
