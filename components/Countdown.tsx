"use client";

import { useEffect, useState } from "react";

export default function Countdown({ until }: { until: string }) {
  const end = new Date(until).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, Math.floor((end - now) / 1000));
  if (left === 0) return <span>expired</span>;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return (
    <span suppressHydrationWarning>
      {h > 0 ? `${h}h ` : ""}
      {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s left
    </span>
  );
}
