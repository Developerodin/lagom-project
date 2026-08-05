"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

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
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  return (
    <nav className={`admin-nav${menuOpen ? " admin-nav--open" : ""}`}>
      <div className="admin-nav__bar">
        <div className="admin-nav__brand">Lagom Admin</div>
        <button
          type="button"
          className="admin-nav__toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="admin-nav__toggle-bar" />
          <span className="admin-nav__toggle-bar" />
          <span className="admin-nav__toggle-bar" />
        </button>
      </div>

      <div id={menuId} className="admin-nav__menu">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const showBadge = link.href === "/admin/submissions" && unreadCount > 0;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-nav__link ${isActive ? "admin-nav__link--active" : ""}`}
              onClick={() => setMenuOpen(false)}
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
      </div>
    </nav>
  );
}
