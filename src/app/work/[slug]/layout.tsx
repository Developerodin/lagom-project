import type { ReactNode } from "react";

export default function WorkDetailLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <main>{children}</main>;
}
