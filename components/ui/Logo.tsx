import { GraduationCap } from "lucide-react";

export function LogoMark({ size }: { size?: "lg" }) {
  return (
    <span className={`brand-mark${size ? ` ${size}` : ""}`} aria-hidden="true">
      <GraduationCap size={size ? 24 : 17} strokeWidth={1.5} />
    </span>
  );
}
