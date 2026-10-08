"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, Shield, UserRound } from "lucide-react";
import Avatar from "./ui/Avatar";

export default function UserMenu({
  name,
  email,
  userId,
  isAdmin,
}: {
  name: string;
  email: string;
  userId: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        className="avatar-btn"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={name} seed={userId} size="sm" />
      </button>
      {open && (
        <div className="menu-content" role="menu">
          <div className="menu-label">
            <strong>{name}</strong>
            <span>{email}</span>
          </div>
          <Link href="/profile" className="menu-item" role="menuitem">
            <UserRound size={18} aria-hidden="true" />
            Your profile
          </Link>
          <Link href="/profile#privacy" className="menu-item" role="menuitem">
            <Settings size={18} aria-hidden="true" />
            Privacy settings
          </Link>
          {isAdmin && (
            <Link href="/admin" className="menu-item" role="menuitem">
              <Shield size={18} aria-hidden="true" />
              Admin
            </Link>
          )}
          <div className="menu-sep" role="separator" />
          <form action="/auth/signout" method="post">
            <button type="submit" className="menu-item danger" role="menuitem">
              <LogOut size={18} aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
