/** A four-pane window with one pane lit: someone is studying. */
export function LogoMark({ size }: { size?: "lg" }) {
  return (
    <span className={`brand-mark${size ? ` ${size}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <rect className="frame" x="1.5" y="1.5" width="29" height="29" rx="7" strokeWidth="1.5" />
        <rect className="lit" x="6" y="6" width="9" height="9" rx="1.5" />
        <rect className="unlit pane-b" x="17" y="6" width="9" height="9" rx="1.5" />
        <rect className="unlit" x="6" y="17" width="9" height="9" rx="1.5" />
        <rect className="unlit" x="17" y="17" width="9" height="9" rx="1.5" />
      </svg>
    </span>
  );
}
