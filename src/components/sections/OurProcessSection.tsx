import Image from "next/image";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ourProcessSectionContent } from "@/content/services";
import styles from "./OurProcessSection.module.css";

type OurProcessSectionProps = {
  loraTitle?: boolean;
};

type ProcessStep = (typeof ourProcessSectionContent.steps)[number];

function ProcessStepItem({
  step,
  loraTitle,
}: {
  step: ProcessStep;
  loraTitle: boolean;
}) {
  const isFinalise = step.title === "Finalise";

  return (
    <li className={styles.step}>
      <div
        className={`${styles.iconWrap} ${isFinalise ? styles.iconWrapLarge : ""}`}
        aria-hidden="true"
      >
        <Image
          src={step.icon.src}
          alt=""
          width={isFinalise ? 180 : 150}
          height={isFinalise ? 180 : 150}
          className={`${styles.icon} ${isFinalise ? styles.iconLarge : ""}`}
          sizes="(min-width: 993px) 180px, 150px"
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3
        className={`${styles.stepTitle} ${loraTitle ? styles.stepTitleLora : ""}`}
      >
        {step.title}
      </h3>
      <p className={styles.stepDescription}>{step.description}</p>
    </li>
  );
}

function ProcessStepRow({
  items,
  loraTitle,
}: {
  items: ProcessStep[];
  loraTitle: boolean;
}) {
  return (
    <div className={styles.stepsRowWrap}>
      <ol className={styles.stepsRow}>
        {items.map((step) => (
          <ProcessStepItem key={step.title} step={step} loraTitle={loraTitle} />
        ))}
      </ol>
    </div>
  );
}

export function OurProcessSection({ loraTitle = false }: OurProcessSectionProps) {
  const { title, subtitle, steps } = ourProcessSectionContent;
  const tabletRows = [steps.slice(0, 3), steps.slice(3)];

  return (
    <RevealOnScroll
      as="section"
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
          <div className={styles.layoutDesktop}>
            <ol className={styles.steps} aria-label="Our process steps">
              {steps.map((step) => (
                <ProcessStepItem
                  key={step.title}
                  step={step}
                  loraTitle={loraTitle}
                />
              ))}
            </ol>
          </div>

          <div
            className={styles.layoutTablet}
            aria-label="Our process steps"
          >
            <ProcessStepRow items={tabletRows[0]} loraTitle={loraTitle} />
            <ProcessStepRow items={tabletRows[1]} loraTitle={loraTitle} />
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}

