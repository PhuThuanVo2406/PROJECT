"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, Info, LayoutDashboard, Menu, MessageCircle, Shield, Users, X } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/study-now", label: "Studying now", Icon: Users },
  { href: "/busy-times", label: "Busy times", Icon: CalendarClock },
  { href: "/messages", label: "Messages", Icon: MessageCircle },
  { href: "/about", label: "About Us", Icon: Info },
];

/** Center nav links on desktop; a hamburger with a drop-down panel on mobile. */
export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const links = (
    <>
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className="nav-link" aria-current={isActive(href) ? "page" : undefined}>
          <Icon size={18} aria-hidden="true" />
          {label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      <div className="nav-links">{links}</div>
      <button
        type="button"
        className="btn-ghost icon-btn nav-toggle"
        style={{ order: 3 }}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
      {open && (
        <div id="mobile-nav" className="mobile-panel">
          {links}
          {isAdmin && (
            <Link href="/admin" className="nav-link" aria-current={isActive("/admin") ? "page" : undefined}>
              <Shield size={18} aria-hidden="true" />
              Admin
            </Link>
          )}
        </div>
      )}
    </>
  );
}
