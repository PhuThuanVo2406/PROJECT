import { GraduationCap } from "lucide-react";

export function LogoMark({ size }: { size?: "lg" }) {
  return (
    <span className={`brand-mark${size ? ` ${size}` : ""}`} aria-hidden="true">
      <GraduationCap size={size ? 28 : 19} strokeWidth={1.75} />
    </span>
  );
}
