import type { ReactNode } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export default function SiteGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <SiteLayout>{children}</SiteLayout>;
}
