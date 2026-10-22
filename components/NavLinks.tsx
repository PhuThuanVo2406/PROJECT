"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const barRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  // A highlight that slides to the hovered link and back to the current page.
  const moveTo = useCallback((el: HTMLElement | null) => {
    setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
  }, []);
  const toActive = useCallback(
    () => moveTo(barRef.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null),
    [moveTo],
  );
  useEffect(() => {
    toActive();
    document.fonts?.ready.then(toActive);
    window.addEventListener("resize", toActive);
    return () => window.removeEventListener("resize", toActive);
  }, [pathname, toActive]);
  const onHover = (e: React.SyntheticEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLElement>(".nav-link");
    if (link) moveTo(link);
  };

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
      <div className="nav-links" ref={barRef} onMouseOver={onHover} onFocus={onHover} onMouseLeave={toActive} onBlur={toActive}>
        <span
          className="nav-indicator"
          aria-hidden="true"
          style={{ width: pill?.w ?? 0, transform: `translateX(${pill?.x ?? 0}px)`, opacity: pill ? 1 : 0 }}
        />
        {links}
      </div>
      <button
        type="button"
        className="btn-ghost icon-btn nav-toggle"
       
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
