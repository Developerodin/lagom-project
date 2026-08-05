import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";

import brandingIcon from "../../../public/assets/home/Icons_ 150 x 150px/branding.png";
import packagingIcon from "../../../public/assets/home/Icons_ 150 x 150px/packaging.png";
import webDesignIcon from "../../../public/assets/home/Icons_ 150 x 150px/web-design.png";
import socialMediaIcon from "../../../public/assets/home/Icons_ 150 x 150px/social-media.png";
import illustrationIcon from "../../../public/assets/home/Icons_ 150 x 150px/illustration.png";
import brandApplicationsIcon from "../../../public/assets/home/Icons_ 150 x 150px/brand-applications.png";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./OurServicesSection.module.css";

type OurServicesSectionProps = {
  variant?: "default" | "dark";
  loraTitle?: boolean;
};

type Service = {
  id: string;
  title: string;
  description: string;
  icon: StaticImageData;
};

const services: Service[] = [
  {
    id: "branding",
    title: "BRANDING",
    description:
      "From strategy to visuals, we build brands that stand out and connect.",
    icon: brandingIcon,
  },
  {
    id: "packaging-design",
    title: "PACKAGING DESIGN",
    description:
      "Thoughtfully designed packaging that elevates your product and brand presence.",
    icon: packagingIcon,
  },
  {
    id: "web-design",
    title: "WEB DESIGN",
    description:
      "We design websites that don't just look good - they perform, engage, and convert.",
    icon: webDesignIcon,
  },
  {
    id: "social-media",
    title: "SOCIAL MEDIA",
    description:
      "Custom-designed social graphics that reflect your brand's aesthetic.",
    icon: socialMediaIcon,
  },
  {
    id: "illustrations",
    title: "ILLUSTRATIONS",
    description: "Add character to your brand with custom illustrations.",
    icon: illustrationIcon,
  },
  {
    id: "brand-applications",
    title: "BRAND APPLICATIONS",
    description:
      "Brochures, invites and branded materials designed to extend your identity seamlessly.",
    icon: brandApplicationsIcon,
  },
];

function ServiceCard({ service }: { service: Service }) {
  return (
    <li className={styles.card}>
      <div className={styles.iconWrap}>
        <Image
          src={service.icon}
          alt=""
          width={150}
          height={150}
          className={styles.icon}
          sizes="(min-width: 993px) 56px, (min-width: 769px) 48px, 36px"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{service.title}</h3>
        <p className={`text-muted ${styles.cardDescription}`}>
          {service.description}
        </p>
      </div>
    </li>
  );
}

function ServiceRow({ items }: { items: Service[] }) {
  return (
    <ul className={styles.row}>
      {items.map((service, index) => (
        <Fragment key={service.id}>
          {index > 0 ? (
            <li className={styles.columnDivider} aria-hidden="true" />
          ) : null}
          <ServiceCard service={service} />
        </Fragment>
      ))}
    </ul>
  );
}

export function OurServicesSection({
  variant = "default",
  loraTitle = false,
}: OurServicesSectionProps) {
  const desktopRows = [services.slice(0, 3), services.slice(3)];
  const tabletRows = [
    services.slice(0, 2),
    services.slice(2, 4),
    services.slice(4),
  ];

  return (
    <RevealOnScroll
      as="section"
      className={`${styles.section} ${
        variant === "dark" ? styles.sectionDark : ""
      }`}
      aria-labelledby="our-services-title"
      data-cursor-contrast={variant === "dark" ? "light" : undefined}
    >
      <div className="container">
        <div className={styles.layout}>
          <h2
            id="our-services-title"
            className={`heading-section ${styles.heading} ${
              loraTitle ? styles.headingLora : ""
            }`}
          >
            OUR SERVICES
          </h2>

          <div className={styles.gridArea}>
            <div className={styles.layoutDesktop}>
              <ServiceRow items={desktopRows[0]} />
              <hr className={`divider ${styles.rowDivider}`} />
              <ServiceRow items={desktopRows[1]} />
            </div>

            <div className={styles.layoutTablet}>
              <ServiceRow items={tabletRows[0]} />
              <hr className={`divider ${styles.rowDivider}`} />
              <ServiceRow items={tabletRows[1]} />
              <hr className={`divider ${styles.rowDivider}`} />
              <ServiceRow items={tabletRows[2]} />
            </div>

            <div className={styles.layoutMobile}>
              <ul className={styles.mobileList}>
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.ctaWrap}>
            <Link
              href="/services"
              className={`button ${
                variant === "dark" ? styles.ctaButtonDark : "button-primary"
              }`}
            >
              View All Services
            </Link>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
