// Flat, muted tones; white text passes WCAG AA on each.
const COLORS = ["#23408e", "#3b4252", "#2f5d50", "#5b4a72", "#6b4d3a", "#2f4f6f", "#4a5568", "#7a3e48"];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export default function Avatar({
  name,
  seed,
  size,
  live,
}: {
  name: string;
  seed?: string;
  size?: "sm";
  live?: boolean;
}) {
  return (
    <span
      className={`avatar${size ? ` ${size}` : ""}`}
      style={{ background: colorFor(seed ?? name) }}
      role="img"
      aria-label={name}
    >
      <span aria-hidden="true">{initials(name)}</span>
      {live && <span className="live-dot" aria-hidden="true" />}
    </span>
  );
}
