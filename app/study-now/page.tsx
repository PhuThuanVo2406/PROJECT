import { requireUser } from "@/lib/supabase/server";
import CampusOptions from "@/components/CampusOptions";
import Link from "next/link";
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
    <div className="stack">
      <div className="row">
        <h1 style={{ marginRight: "auto" }}>Students studying now</h1>
        <Link href="/busy-times">See busy times</Link>
      </div>
      <form className="card row" method="get">
        <label style={{ flex: 1 }}>
          Campus
          <select name="campus" defaultValue={sp.campus ?? ""}>
            <option value="">All campuses</option>
            <CampusOptions campuses={campuses} />
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Subject
          <select name="subject" defaultValue={sp.subject ?? ""}>
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Goal
          <select name="goal" defaultValue={sp.goal ?? ""}>
            <option value="">Any goal</option>
            {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Study style
          <select name="style" defaultValue={sp.style ?? ""}>
            <option value="">Any style</option>
            {Object.entries(STUDY_STYLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <button type="submit" style={{ alignSelf: "flex-end" }}>Filter</button>
      </form>
      {students.length === 0 ? (
        <p className="muted">Nobody matches right now. Check in yourself so others can find you.</p>
      ) : (
        <div className="grid">
          {students.map((s) => <StudentCard key={s.student.checkInId} s={s.student} />)}
        </div>
      )}
    </div>
  );
}
