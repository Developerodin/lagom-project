import type { Metadata } from "next";
import { montserrat, lora } from "@/lib/fonts";
import { siteConfig } from "@/content/site";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  icons: {
    icon: "/assets/favicon/option-1.png",
    apple: "/assets/favicon/option-1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
