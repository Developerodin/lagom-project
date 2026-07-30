import { contactFormContent, contactInfoContent } from "@/content/contact";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ContactForm } from "./ContactForm";
import styles from "./ContactSection.module.css";

function EmailIcon() {
  return (
    <svg
      className={styles.iconSvg}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className={styles.iconSvg}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      className={styles.iconSvg}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className={styles.iconSvg}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

const contactIcons = {
  email: EmailIcon,
  phone: PhoneIcon,
  location: LocationIcon,
  hours: ClockIcon,
} as const;

export function ContactSection() {
  const { title: formTitle } = contactFormContent;
  const { title: infoTitle, items } = contactInfoContent;

  return (
    <RevealOnScroll as="section" className={styles.section} aria-labelledby="contact-form-title">
      <div className={styles.layout}>
        <div className={styles.formCol}>
          <h1 id="contact-form-title" className={styles.sectionTitle}>
            {formTitle}
          </h1>

          <ContactForm />
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.infoCol}>
          <h2 className={styles.sectionTitle}>{infoTitle}</h2>

          <ul className={styles.infoList}>
            {items.map((item) => {
              const Icon = contactIcons[item.id as keyof typeof contactIcons];

              return (
                <li key={item.id} className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    <Icon />
                  </div>

                  <div className={styles.infoText}>
                    {"href" in item && item.href ? (
                      <a href={item.href} className={styles.infoValue}>
                        {item.value}
                      </a>
                    ) : (
                      <span className={styles.infoValue}>{item.value}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </RevealOnScroll>
  );
}
