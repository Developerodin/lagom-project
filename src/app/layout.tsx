import type { Metadata } from "next";
import { montserrat, lora } from "@/lib/fonts";
import { siteConfig } from "@/content/site";
import "@/styles/global.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.tagline,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.tagline,
  },
  icons: {
    icon: [
      {
        url: "/assets/favicon/option-2.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/assets/favicon/option-3.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/assets/favicon/option-2.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/assets/favicon/option-3.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${lora.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
