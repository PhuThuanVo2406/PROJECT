import Link from "next/link";
import { ArrowRight, Building2, Clock, MapPin, Sparkles } from "lucide-react";
import { GOALS, SPOTS, STUDY_STYLES, isSpot, type Goal } from "@/lib/constants";
import Avatar from "./ui/Avatar";
import Countdown from "./Countdown";
import RelativeTime from "./ui/RelativeTime";

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

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit" });
}

export default function StudentCard({ s, reasons }: { s: ActiveStudent; reasons?: string[] }) {
  const where = [s.spot && isSpot(s.spot) ? SPOTS[s.spot] : null, s.spotDetail].filter(Boolean).join(", ");
  return (
    <article className="card card-hover person-card" aria-label={`${s.name}, studying ${s.subject}`}>
      <div className="person-head">
        <Avatar name={s.name} seed={s.userId} />
        <div style={{ flex: 1 }}>
          <p className="person-name">{s.name}</p>
          <p className="person-sub">{s.major ?? "HCC student"}</p>
        </div>
        <span className="live-pill" style={{ alignSelf: "flex-start" }}>
          <span className="live-dot" aria-hidden="true" />
          Studying now
        </span>
      </div>

      <div className="chips">
        <span className="badge">{s.subject}</span>
        <span className="badge neutral">{GOALS[s.goal]}</span>
      </div>

      <ul className="person-meta">
        <li>
          <MapPin size={16} aria-hidden="true" />
          <span>{s.campus}</span>
        </li>
        {where && (
          <li>
            <Building2 size={16} aria-hidden="true" />
            <span>{where}</span>
          </li>
        )}
        <li>
          <Clock size={16} aria-hidden="true" />
          <span>
            Checked in {clockTime(s.startedAt)} · <RelativeTime since={s.startedAt} />
            <span className="muted"> · <Countdown until={s.expiresAt} /></span>
          </span>
        </li>
      </ul>

      {s.studyStyles.length > 0 && (
        <div className="chips" aria-label="Study styles">
          {s.studyStyles.map((st) => (
            <span key={st} className="badge accent">{STUDY_STYLES[st as keyof typeof STUDY_STYLES] ?? st}</span>
          ))}
        </div>
      )}

      {s.note && <p className="person-note">{s.note}</p>}

      {reasons && reasons.length > 0 && (
        <p className="person-reasons" style={{ margin: 0 }}>
          <Sparkles size={14} aria-hidden="true" />
          Good match: {reasons.join(", ")}
        </p>
      )}

      <div className="person-actions">
        <Link href={`/messages/${s.userId}`} className="btn btn-link" aria-label={`Message ${s.name}`}>
          Message
          <ArrowRight className="arrow" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
