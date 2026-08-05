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
import { HomeLogoLink } from "./HomeLogoLink";
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

function WhatsAppIcon() {
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
      <path d="M3 21l1.9-4A8.5 8.5 0 1 1 7.5 19.5L3 21z" />
      <path d="M8.8 9.5c.2-.6.5-.6.8-.6h.5c.2 0 .4 0 .5.4l.6 1.6c.1.2 0 .5-.2.6l-.3.4c-.1.2-.1.4.1.6.5.6 1.1 1.1 1.8 1.5.3.2.6.2.8 0l.5-.3c.2-.1.4-.1.6.1l1.4.7c.2.1.4.3.3.6v.5c0 .3-.2.6-.6.7-.7.3-1.5.3-2.4 0-1.7-.6-3.1-1.9-4-3.5-.5-.8-.8-1.7-.8-2.5.1-.6.3-1 .6-1.3z" />
    </svg>
  );
}

const socialIcons: Record<SocialLink["icon"], () => ReactNode> = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
};

const emailItem = contactInfoContent.items.find((item) => item.id === "email");
const phoneItem = contactInfoContent.items.find((item) => item.id === "phone");

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <RevealOnScroll
      as="footer"
      className={styles.footer}
      data-cursor-contrast="light"
    >
      <Image
        src="/assets/home/footer.jpg"
        alt=""
        fill
        sizes="(min-width: 769px) 100vw, 1px"
        quality={100}
        loading="lazy"
        decoding="async"
        className={styles.footerBgDesktop}
        aria-hidden="true"
      />
      <Image
        src="/assets/home/footer-mobile.jpg"
        alt=""
        width={600}
        height={600}
        quality={100}
        unoptimized
        loading="lazy"
        decoding="async"
        className={styles.footerBgMobile}
        aria-hidden="true"
      />
      <div className={styles.inner}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <HomeLogoLink className={styles.logo} aria-label={siteConfig.name}>
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
            </HomeLogoLink>

            <p className={styles.tagline}>
              Designing brands
              <br />
              people choose.
            </p>
          </div>

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
