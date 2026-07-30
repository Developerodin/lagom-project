import { balanceFoundContent } from "@/content/home";
import styles from "./BalanceFoundSection.module.css";

export function BalanceFoundSection() {
  const { captions } = balanceFoundContent;

  return (
    <section className={styles.section} aria-label="Balance found">
      <div className={`container ${styles.wrap}`}>
        <div className={styles.beamRow}>
          <div className={styles.beamTrack} aria-hidden="true">
            <div className={styles.beamLine} />
            <div className={styles.beamDot} />
          </div>
          <div className={styles.beamCaption}>
            {captions.map((caption) => (
              <span key={caption}>{caption}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
