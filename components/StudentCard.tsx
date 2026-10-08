import Link from "next/link";
import { GOALS, SPOTS, STUDY_STYLES, formatStarted, isSpot, type Goal } from "@/lib/constants";
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
  spot: string | null;
  spotDetail: string | null;
  studyStyles: string[];
  startedAt: string;
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
        {s.campus}
        {(s.spot || s.spotDetail) && (
          <> · {[s.spot && isSpot(s.spot) ? SPOTS[s.spot] : null, s.spotDetail].filter(Boolean).join(", ")}</>
        )}
      </div>
      <div className="muted">
        Checked in {formatStarted(s.startedAt)} · <Countdown until={s.expiresAt} />
      </div>
      {s.studyStyles.length > 0 && (
        <div className="row">
          {s.studyStyles.map((st) => (
            <span key={st} className="badge">{STUDY_STYLES[st as keyof typeof STUDY_STYLES] ?? st}</span>
          ))}
        </div>
      )}
      {s.note && <p style={{ margin: 0 }}>{s.note}</p>}
      {reasons && reasons.length > 0 && <div className="muted">Match: {reasons.join(", ")}</div>}
      <Link href={`/messages/${s.userId}`} className="button secondary">Message</Link>
    </div>
  );
}
