// Deep blue, indigo, teal and violet gradients; white text passes WCAG AA on each.
const COLORS = [
  "linear-gradient(135deg, #1e40af, #2563eb)",
  "linear-gradient(135deg, #3730a3, #4f46e5)",
  "linear-gradient(135deg, #115e59, #0f766e)",
  "linear-gradient(135deg, #1e3a8a, #0369a1)",
  "linear-gradient(135deg, #5b21b6, #6d28d9)",
  "linear-gradient(135deg, #155e75, #0e7490)",
  "linear-gradient(135deg, #1e3a8a, #4338ca)",
  "linear-gradient(135deg, #0c4a6e, #1d4ed8)",
];

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
