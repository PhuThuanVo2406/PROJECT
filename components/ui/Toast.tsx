"use client";

import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

/** A one-off toast shown when the page loads, e.g. for a server action result. */
export default function Toast({
  title,
  message,
  tone = "success",
  duration = 5000,
}: {
  title: string;
  message?: string;
  tone?: "success" | "error";
  duration?: number;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
    const t = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(t);
  }, [title, message, duration]);

  if (!open) return null;
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div className="toast-region">
      <div className={`toast ${tone}`} role={tone === "error" ? "alert" : "status"}>
        <Icon className="toast-icon" size={20} aria-hidden="true" />
        <div>
          <strong>{title}</strong>
          {message && <span className="text-secondary">{message}</span>}
        </div>
        <button type="button" className="btn-ghost icon-btn btn-sm" aria-label="Dismiss" onClick={() => setOpen(false)}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
