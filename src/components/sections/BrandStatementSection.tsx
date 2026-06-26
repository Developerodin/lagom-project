import { brandStatementContent } from "@/content/home";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./BrandStatementSection.module.css";

type BrandStatementSectionProps = {
  loraTitle?: boolean;
};

export function BrandStatementSection({
  loraTitle = false,
}: BrandStatementSectionProps) {
  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="brand-statement-title"
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <h1
            id="brand-statement-title"
            className={`${styles.headline} ${loraTitle ? styles.headlineLora : ""}`}
          >
            {brandStatementContent.headline.map((segment) =>
              segment.emphasis ? (
                <strong key={segment.text} className={styles.emphasis}>
                  {segment.text}
                </strong>
              ) : (
                <span key={segment.text}>{segment.text}</span>
              ),
            )}
          </h1>

          <div className={styles.taglines}>
            {brandStatementContent.taglines.map((line) => (
              <p key={line} className={styles.tagline}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
