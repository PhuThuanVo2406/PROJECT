import { requireUser } from "@/lib/supabase/server";
import CampusOptions from "@/components/CampusOptions";
import Link from "next/link";
import { CalendarClock, SlidersHorizontal, Users } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { GOALS, STUDY_STYLES, SUBJECTS } from "@/lib/constants";
import { getActiveStudents, getCampuses } from "@/lib/queries";
import StudentCard from "@/components/StudentCard";

export default async function StudyNow({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string; subject?: string; goal?: string; style?: string }>;
}) {
  const sp = await searchParams;
  const { supabase, user } = await requireUser();
  const campuses = await getCampuses(supabase);
  const students = await getActiveStudents(supabase, user.id, campuses, {
    campusId: sp.campus ? Number(sp.campus) : undefined,
    subject: sp.subject || undefined,
    goal: sp.goal || undefined,
    style: sp.style || undefined,
  });

  return (
    <div className="stack-lg">
      <header className="page-header animate-in">
        <div>
          <p className="eyebrow">Directory / Right now</p>
          <h1>Studying now</h1>
          <p>Classmates checked in across HCC campuses right now.</p>
        </div>
        <Link href="/busy-times" className="btn btn-outline">
          <CalendarClock size={18} aria-hidden="true" />
          See busy times
        </Link>
      </header>
      <form className="card animate-in" method="get" role="search" aria-label="Filter classmates">
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", alignItems: "end" }}>
        <label>
          Campus
          <select name="campus" defaultValue={sp.campus ?? ""}>
            <option value="">All campuses</option>
            <CampusOptions campuses={campuses} />
          </select>
        </label>
        <label>
          Subject
          <select name="subject" defaultValue={sp.subject ?? ""}>
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Goal
          <select name="goal" defaultValue={sp.goal ?? ""}>
            <option value="">Any goal</option>
            {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>
          Study style
          <select name="style" defaultValue={sp.style ?? ""}>
            <option value="">Any style</option>
            {Object.entries(STUDY_STYLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <button type="submit">
          <SlidersHorizontal size={18} aria-hidden="true" />
          Filter
        </button>
        </div>
      </form>
      {students.length === 0 ? (
        <EmptyState
          icon={<Users size={26} />}
          title="Nobody matches right now"
          action={<Link href="/dashboard#check-in" className="btn">I&apos;m studying now</Link>}
        >
          Check in yourself so classmates can find you, or try fewer filters.
        </EmptyState>
      ) : (
        <div className="grid-cards animate-in-list">
          {students.map((s, i) => (
            <div key={s.student.checkInId} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
              <StudentCard s={s.student} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
