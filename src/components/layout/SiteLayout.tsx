import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SiteCursor } from "@/components/layout/SiteCursor";

type SiteLayoutProps = {
  children: ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <SiteCursor />
      <ScrollToTop />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
