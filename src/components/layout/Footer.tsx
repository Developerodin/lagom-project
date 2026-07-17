import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  footerNavigation,
  siteConfig,
  socialLinks,
  type SocialLink,
} from "@/content/site";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./Footer.module.css";

function LinkedInIcon() {
  return (
    <svg
      className={styles.socialIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" rx="1" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      className={styles.socialIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialIcons: Record<SocialLink["icon"], () => ReactNode> = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <RevealOnScroll as="footer" className={styles.footer}>
      <Image
        src="/assets/home/footer.jpg"
        alt=""
        fill
        sizes="100vw"
        className={styles.footerBg}
        aria-hidden="true"
      />
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink} aria-label={siteConfig.name}>
              <Image
                src="/assets/logo/logo.png"
                alt=""
                width={150}
                height={83}
                className={styles.logoImage}
              />
              <span className="sr-only">{siteConfig.name}</span>
            </Link>
          </div>

          <nav className={styles.nav} aria-label="Footer navigation">
            <div>
              <p className={styles.navHeading}>Quick links</p>
              <ul className={styles.navList}>
                {footerNavigation.map((item) => (
                  <li key={item.href} className={styles.navItem}>
                    <Link href={item.href} className={styles.navLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <hr className={`divider ${styles.divider}`} />

        <div className={styles.bottom}>
          <p className={`body-sm text-muted ${styles.copyright}`}>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>

          <div className={styles.social}>
            <div className={styles.bottomDivider} aria-hidden="true" />
            <ul className={styles.socialList}>
              {socialLinks.map((link) => {
                const Icon = socialIcons[link.icon];

                return (
                  <li key={link.href} className={styles.socialItem}>
                    <a
                      href={link.href}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                    >
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
