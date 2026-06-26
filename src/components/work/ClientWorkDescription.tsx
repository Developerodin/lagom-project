import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./ClientWorkDescription.module.css";

type ClientWorkDescriptionProps = {
  title: string;
  description: string;
};

export function ClientWorkDescription({
  title,
  description,
}: ClientWorkDescriptionProps) {
  const paragraphs = description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <RevealOnScroll as="section" className={`section-md ${styles.section}`}>
      <div className="container">
        <h2 className={`heading-section ${styles.title}`}>{title}</h2>
        <div className={styles.body}>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="body">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
