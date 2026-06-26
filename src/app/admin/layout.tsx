import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { isAuthenticated } from "@/lib/auth";
import { getUnreadSubmissionCount } from "@/lib/contact";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const authed = await isAuthenticated();

  if (!authed) {
    return <div className="admin-root">{children}</div>;
  }

  let unreadCount = 0;
  try {
    unreadCount = await getUnreadSubmissionCount();
  } catch {
    unreadCount = 0;
  }

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <AdminNav unreadCount={unreadCount} />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
