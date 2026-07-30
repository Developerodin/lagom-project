import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { stationaryHeroContent } from "@/content/stationary";
import styles from "./StationaryHeroSection.module.css";

export function StationaryHeroSection() {
  const { line1, accent, body } = stationaryHeroContent;

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="stationary-hero-title"
    >
      <div className={`container ${styles.inner}`}>
        <h1 id="stationary-hero-title" className={styles.title}>
          <span className={styles.line}>{line1}</span>
          <em className={styles.accent}>{accent}</em>
        </h1>
        <p className={styles.body}>{body}</p>
      </div>
    </RevealOnScroll>
  );
}
