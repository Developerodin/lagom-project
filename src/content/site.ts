export const siteConfig = {
  name: "Lagom Design",
  tagline: "Designing brands people choose.",
  url: "https://studiolagomdesign.com",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Stationery", href: "/stationary" },
  { label: "Contact", href: "/contact" },
];

export const footerNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Stationery", href: "/stationary" },
  { label: "Contact", href: "/contact" },
];

export type SocialLink = {
  label: string;
  href: string;
  icon: "instagram" | "linkedin" | "whatsapp";
};

export const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/studiolagomdesign?igsh=MWNueTJiODZ4a3V5MQ==",
    icon: "instagram",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/lagom-design-studio/",
    icon: "linkedin",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919219046483",
    icon: "whatsapp",
  },
];
