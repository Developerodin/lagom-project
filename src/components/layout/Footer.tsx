import Image from "next/image";
import Link from "next/link";
import { footerNavigation, siteConfig } from "@/content/site";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
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
            <p className={`body-sm text-muted ${styles.tagline}`}>
              {siteConfig.tagline}
            </p>
          </div>

          <nav className={styles.nav} aria-label="Footer navigation">
            <ul className={styles.navList}>
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <hr className="divider" />

        <div className={styles.bottom}>
          <p className={`body-sm text-muted ${styles.copyright}`}>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
