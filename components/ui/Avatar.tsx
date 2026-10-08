// Muted slate, stone and mist tones; white text passes WCAG AA on each.
const COLORS = ["#3f5563", "#4a5a52", "#5b4f63", "#62514a", "#3e4f6b", "#4d5b5e", "#5a5048", "#41566e"];

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
