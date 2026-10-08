"use client";

import { useEffect, useState } from "react";

export function formatRelative(from: number, now: number) {
  const mins = Math.max(0, Math.round((now - from) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min ago` : `${h} hr ago`;
}

/** "45 min ago", refreshed every 30 seconds. */
export default function RelativeTime({ since }: { since: string }) {
  const start = new Date(since).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <time dateTime={since} title={new Date(since).toLocaleString()} suppressHydrationWarning>
      {formatRelative(start, now)}
    </time>
  );
}
