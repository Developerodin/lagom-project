import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./ClientWorkDescription.module.css";

type ClientWorkDescriptionProps = {
  clientName: string;
  description: string;
  services: string | null;
  category: string | null;
};

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function splitLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ClientWorkDescription({
  clientName,
  description,
  services,
  category,
}: ClientWorkDescriptionProps) {
  const paragraphs = splitParagraphs(description);
  const serviceLines = splitLines(services ?? "");

  return (
    <RevealOnScroll as="section" className={`section-md ${styles.section}`}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <h2 className={styles.heading}>Client</h2>
              <p className={styles.metaValue}>{clientName}</p>
            </div>

            {serviceLines.length > 0 ? (
              <div className={styles.metaItem}>
                <h2 className={styles.heading}>Services</h2>
                <ul className={styles.servicesList}>
                  {serviceLines.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {category ? (
              <div className={styles.metaItem}>
                <h2 className={styles.heading}>Category</h2>
                <p className={styles.metaValue}>{category}</p>
              </div>
            ) : null}
          </div>

          {paragraphs.length > 0 ? (
            <div className={styles.about}>
              <h2 className={styles.heading}>About the Project</h2>
              <div className={styles.aboutBody}>
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </RevealOnScroll>
  );
}
