"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type AdminNavProps = {
  unreadCount: number;
};

const links = [
  { href: "/admin/clients", label: "Work" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/submissions", label: "Enquiries" },
  { href: "/admin/stationary-signups", label: "Launch signups" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ unreadCount }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  return (
    <nav className="admin-nav">
      <div className="admin-nav__brand">Lagom Admin</div>

      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const showBadge = link.href === "/admin/submissions" && unreadCount > 0;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-nav__link ${isActive ? "admin-nav__link--active" : ""}`}
          >
            <span>{link.label}</span>
            {showBadge ? (
              <span className="admin-nav__badge">{unreadCount}</span>
            ) : null}
          </Link>
        );
      })}

      <div className="admin-nav__spacer" />

      <button type="button" className="admin-nav__link" onClick={handleLogout}>
        Sign out
      </button>
    </nav>
  );
}
