import { requireUser } from "@/lib/supabase/server";
import { DURATIONS, GOALS, SUBJECTS, type Goal } from "@/lib/constants";
import { getActiveStudents, getCampuses, getMyActiveCheckIn } from "@/lib/queries";
import { rankMatches } from "@/lib/matching";
import Countdown from "@/components/Countdown";
import StudentCard, { type ActiveStudent } from "@/components/StudentCard";
import type { Profile } from "@/lib/types";
import { checkIn, checkOut } from "./actions";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();
  const [{ data: profile }, campuses, active] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    getCampuses(supabase),
    getMyActiveCheckIn(supabase, user.id),
  ]);

  const campusName = (id: number) => campuses.find((c) => c.id === id)?.name ?? "HCC";

  let matches: { student: ActiveStudent; reasons: string[] }[] = [];
  if (active) {
    const others = await getActiveStudents(supabase, user.id, campuses);
    matches = rankMatches(
      { subject: active.subject, goal: active.goal, campusId: active.campus_id, profileSubjects: profile?.subjects ?? [] },
      others.map((o) => ({
        student: o.student,
        match: { subject: o.student.subject, goal: o.student.goal, campusId: o.campusId, profileSubjects: o.profileSubjects },
      })),
    );
  }

  return (
    <div className="stack">
      <h1>Hi {profile?.display_name ?? "there"}</h1>
      {profile && !profile.is_visible && (
        <p className="muted">You are hidden. Others cannot see your check-ins. Change this in your profile.</p>
      )}

      {active ? (
        <section className="card stack">
          <h2>You are checked in</h2>
          <div className="row">
            <span className="badge">{active.subject}</span>
            <span className="badge ok">{GOALS[active.goal as Goal]}</span>
            <span className="muted">{campusName(active.campus_id)} campus · <Countdown until={active.expires_at} /></span>
          </div>
          <form action={checkOut}>
            <input type="hidden" name="check_in_id" value={active.id} />
            <button className="secondary" type="submit">Check out</button>
          </form>
        </section>
      ) : (
        <form action={checkIn} className="card stack">
          <h2>Check in to a campus</h2>
          <p className="muted">Only your campus is shared. Your check-in ends automatically.</p>
          <div className="grid">
            <label>
              Campus
              <select name="campus_id" required defaultValue={profile?.home_campus_id ?? ""}>
                <option value="" disabled>Choose a campus</option>
                {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>
              Subject
              <select name="subject" required defaultValue={profile?.subjects?.[0] ?? ""}>
                <option value="" disabled>Choose a subject</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Goal
              <select name="goal" required defaultValue="homework">
                {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>
              For how long
              <select name="minutes" defaultValue={60}>
                {DURATIONS.map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} hr`}</option>)}
              </select>
            </label>
          </div>
          <label>
            Note (optional)
            <input name="note" maxLength={140} placeholder="e.g. 2nd floor library, working on Ch. 4" />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Check in</button>
        </form>
      )}

      {active && (
        <section className="stack">
          <h2>Suggested study buddies</h2>
          {matches.length === 0 ? (
            <p className="muted">No good matches yet. Browse everyone in Studying now.</p>
          ) : (
            <div className="grid">
              {matches.map((m) => <StudentCard key={m.student.checkInId} s={m.student} reasons={m.reasons} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
