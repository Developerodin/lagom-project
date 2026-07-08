import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./ClientWorkDescription.module.css";

type ClientWorkDescriptionProps = {
  description: string;
  whatWeDid: string | null;
  category: string | null;
};

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function ClientWorkDescription({
  description,
  whatWeDid,
  category,
}: ClientWorkDescriptionProps) {
  const paragraphs = splitParagraphs(description);
  const whatWeDidParagraphs = splitParagraphs(whatWeDid ?? "");
  const hasMeta = Boolean(category) || whatWeDidParagraphs.length > 0;

  return (
    <RevealOnScroll as="section" className={`section-md ${styles.section}`}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.summary}>
            <p className={styles.label}>THE PROJECT SUMMARY :</p>
            <div className={styles.body}>
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="body">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {hasMeta ? (
            <aside className={styles.meta} aria-label="Project details">
              {whatWeDidParagraphs.length > 0 ? (
                <div className={styles.metaItem}>
                  <p className={styles.label}>WHAT WE DID :</p>
                  <div className={styles.metaValue}>
                    {whatWeDidParagraphs.map((paragraph, index) => (
                      <p key={index} className="body">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {category ? (
                <div className={styles.metaItem}>
                  <p className={styles.label}>CATEGORY</p>
                  <p className={`body ${styles.metaValue}`}>{category}</p>
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    </RevealOnScroll>
  );
}
