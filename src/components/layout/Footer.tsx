import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { contactInfoContent } from "@/content/contact";
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

const emailItem = contactInfoContent.items.find((item) => item.id === "email");
const phoneItem = contactInfoContent.items.find((item) => item.id === "phone");

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <RevealOnScroll as="footer" className={styles.footer}>
      <Image
        src="/assets/home/footer.jpg"
        alt=""
        fill
        sizes="100vw"
        loading="lazy"
        decoding="async"
        className={styles.footerBg}
        aria-hidden="true"
      />
      <div className={styles.inner}>
        <div className={styles.main}>
          <Link href="/" className={styles.logo} aria-label={siteConfig.name}>
            <Image
              src="/assets/logo/lagom-design-logo-footer-mark.png"
              alt=""
              width={608}
              height={358}
              className={styles.logoImage}
              loading="lazy"
              decoding="async"
            />
            <span className="sr-only">{siteConfig.name}</span>
          </Link>

          <div className={styles.columns}>
            <nav className={styles.nav} aria-label="Footer navigation">
              <ul className={styles.linkList}>
                {footerNavigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.navLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.contactList}>
              {emailItem && "href" in emailItem && (
                <a href={emailItem.href} className={styles.contactLink}>
                  {emailItem.value}
                </a>
              )}
              {phoneItem && "href" in phoneItem && (
                <a href={phoneItem.href} className={styles.contactLink}>
                  {phoneItem.value}
                </a>
              )}
              <div className={styles.socials}>
                {socialLinks.map((link, index) => {
                  const Icon = socialIcons[link.icon];

                  return (
                    <span key={link.href} className={styles.socialItem}>
                      {index > 0 && (
                        <span className={styles.socialDivider} aria-hidden="true" />
                      )}
                      <a
                        href={link.href}
                        className={styles.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                      >
                        <Icon />
                      </a>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.trademarkBlock}>
          <hr className={styles.trademarkDivider} />
          <p className={styles.trademark}>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </RevealOnScroll>
  );
}
