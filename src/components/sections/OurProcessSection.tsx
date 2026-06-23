import Image from "next/image";

import { ourProcessSectionContent } from "@/content/services";
import styles from "./OurProcessSection.module.css";

type OurProcessSectionProps = {
  loraTitle?: boolean;
};

export function OurProcessSection({ loraTitle = false }: OurProcessSectionProps) {
  const { title, subtitle, steps } = ourProcessSectionContent;

  return (
    <section
      className={`section-md ${styles.section}`}
      aria-labelledby="our-process-title"
    >
      <div className="container">
        <header className={styles.header}>
          <h2
            id="our-process-title"
            className={`${styles.title} ${loraTitle ? styles.titleLora : ""}`}
          >
            {title}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <div className={styles.stepsWrap}>
          <ol className={styles.steps} aria-label="Our process steps">
            {steps.map((step) => (
              <li key={step.title} className={styles.step}>
                <div className={styles.iconWrap} aria-hidden="true">
                  <Image
                    src={step.icon.src}
                    alt=""
                    width={150}
                    height={150}
                    className={styles.icon}
                  />
                </div>
                <h3
                  className={`${styles.stepTitle} ${loraTitle ? styles.stepTitleLora : ""}`}
                >
                  {step.title}
                </h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

