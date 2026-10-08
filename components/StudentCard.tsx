import Link from "next/link";
import { GOALS, type Goal } from "@/lib/constants";
import Countdown from "./Countdown";

export type ActiveStudent = {
  checkInId: number;
  userId: string;
  name: string;
  major: string | null;
  campus: string;
  subject: string;
  goal: Goal;
  note: string | null;
  expiresAt: string;
};

export default function StudentCard({ s, reasons }: { s: ActiveStudent; reasons?: string[] }) {
  return (
    <div className="card stack" style={{ marginBottom: 0 }}>
      <div>
        <strong>{s.name}</strong>
        {s.major && <span className="muted"> · {s.major}</span>}
      </div>
      <div className="row">
        <span className="badge">{s.subject}</span>
        <span className="badge ok">{GOALS[s.goal]}</span>
      </div>
      <div className="muted">
        {s.campus} · <Countdown until={s.expiresAt} />
      </div>
      {s.note && <p style={{ margin: 0 }}>{s.note}</p>}
      {reasons && reasons.length > 0 && <div className="muted">Match: {reasons.join(", ")}</div>}
      <Link href={`/messages/${s.userId}`} className="button secondary">Message</Link>
    </div>
  );
}
