import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  stationaryValuesContent,
  type StationaryValueIcon,
} from "@/content/stationary";
import styles from "./StationaryValuesSection.module.css";

function ValueIcon({ type }: { type: StationaryValueIcon }) {
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
    className: styles.iconSvg,
  };

  switch (type) {
    case "design":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M28.5 14.5l5 5-12.5 12.5H16v-5L28.5 14.5z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "quality":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M24 16.5c1.8-2.2 5.5-1.8 6.6 1 1 2.5-.2 5.2-2.8 7.3L24 30l-3.8-5.2c-2.6-2.1-3.8-4.8-2.8-7.3 1.1-2.8 4.8-3.2 6.6-1z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "order":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M24 12v4M24 32v4M12 24h4M32 24h4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case "delivery":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M24 14c-4.5 0-8 3.6-8 9 0 6.2 8 11 8 11s8-4.8 8-11c0-5.4-3.5-9-8-9z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="23" r="2.5" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      );
  }
}

export function StationaryValuesSection() {
  const { items } = stationaryValuesContent;

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-label="Stationery values"
      data-cursor-contrast="light"
    >
      <div className={`container ${styles.inner}`}>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.icon} aria-hidden="true">
                <ValueIcon type={item.icon} />
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.body}>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </RevealOnScroll>
  );
}
