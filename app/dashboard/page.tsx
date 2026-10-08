import Link from "next/link";
import { ArrowRight, CalendarClock, Clock, EyeOff, Lock, MapPin, Radio, Sparkles, Users } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import CampusOptions from "@/components/CampusOptions";
import { DURATIONS, GOALS, SPOTS, SUBJECTS, isSpot, type Goal } from "@/lib/constants";
import { getActiveStudents, getCampuses, getMyActiveCheckIn } from "@/lib/queries";
import { rankMatches } from "@/lib/matching";
import Countdown from "@/components/Countdown";
import StudentCard, { type ActiveStudent } from "@/components/StudentCard";
import ClassmateList from "@/components/ClassmateList";
import SubmitButton from "@/components/ui/SubmitButton";
import Toast from "@/components/ui/Toast";
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

  // Everyone else checked in right now, for the stats and the list below.
  const others = await getActiveStudents(supabase, user.id, campuses);

  let matches: { student: ActiveStudent; reasons: string[] }[] = [];
  if (active) {
    matches = rankMatches(
      { subject: active.subject, goal: active.goal, campusId: active.campus_id, profileSubjects: profile?.subjects ?? [], studyStyles: profile?.study_styles ?? [] },
      others.map((o) => ({
        student: o.student,
        match: { subject: o.student.subject, goal: o.student.goal, campusId: o.campusId, profileSubjects: o.profileSubjects, studyStyles: o.student.studyStyles },
      })),
    );
  }

  const firstName = profile?.display_name?.trim().split(/\s+/)[0] || "there";
  const myCampusId = active?.campus_id ?? profile?.home_campus_id ?? null;
  const myCampus = myCampusId ? campusName(myCampusId) : null;
  const atMyCampus = myCampusId ? others.filter((o) => o.campusId === myCampusId).length : 0;
  const activeSpot = active
    ? [active.spot && isSpot(active.spot) ? SPOTS[active.spot] : null, active.spot_detail].filter(Boolean).join(", ")
    : "";

  return (
    <div className="stack-lg">
      {error && <Toast tone="error" title="Couldn't check you in" message={error} />}

      <header className="page-header animate-in">
        <div>
          <p className="eyebrow">Dashboard / HCC Study Buddy</p>
          <h1>Welcome back, {firstName}</h1>
          <p>
            {active
              ? "You're checked in. Here's who is studying around you."
              : "See who's studying on campus right now, and let classmates know you're here."}
          </p>
        </div>
        {active ? (
          <Link href="/study-now" className="btn btn-outline">
            <Users size={18} aria-hidden="true" />
            Browse everyone
          </Link>
        ) : (
          <a href="#check-in" className="btn btn-lg">
            I&apos;m studying now
            <ArrowRight className="arrow" aria-hidden="true" />
          </a>
        )}
      </header>

      {profile && !profile.is_visible && (
        <p className="alert warning">
          <EyeOff size={18} aria-hidden="true" />
          <span>
            You&apos;re hidden, so classmates can&apos;t see your check-ins. <Link href="/profile#privacy">Change this in your profile</Link>.
          </span>
        </p>
      )}

      <section className="grid-stats animate-in-list" aria-label="Overview">
        <div className="card stat-card" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="icon-tile accent"><Users size={20} aria-hidden="true" /></span>
          <div>
            <p className="stat-label">Classmates studying now</p>
            <p className="stat-value big">{others.length}</p>
            <p className="stat-meta">
              {myCampus ? `${atMyCampus} at ${myCampus}` : "Across all HCC campuses"}
            </p>
          </div>
        </div>
        <div className="card stat-card" style={{ "--i": 1 } as React.CSSProperties}>
          <span className="icon-tile"><MapPin size={20} aria-hidden="true" /></span>
          <div>
            <p className="stat-label">Your campus</p>
            <p className="stat-value" title={myCampus ?? undefined}>{myCampus ?? "Not set"}</p>
            <p className="stat-meta">
              {active ? "Where you're checked in" : myCampus ? "Your home campus" : <Link href="/profile">Set a home campus</Link>}
            </p>
          </div>
        </div>
        <div className="card stat-card" style={{ "--i": 2 } as React.CSSProperties}>
          <span className={`icon-tile ${active ? "success" : "neutral"}`}><Radio size={20} aria-hidden="true" /></span>
          <div>
            <p className="stat-label">Your status</p>
            <p className="stat-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {active && <span className="live-dot" aria-hidden="true" />}
              {active ? "Studying now" : "Not checked in"}
            </p>
            <p className="stat-meta">
              {active ? <Countdown until={active.expires_at} /> : "Check in so classmates can find you"}
            </p>
          </div>
        </div>
      </section>

      {active ? (
        <section className="card status-card animate-in" aria-labelledby="status-title">
          <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
            <div className="stack-sm" style={{ flex: 1, minWidth: 240 }}>
              <span className="live-pill" style={{ alignSelf: "flex-start" }}>
                <span className="live-dot" aria-hidden="true" />
                You&apos;re studying now
              </span>
              <h2 id="status-title" style={{ margin: "4px 0 0" }}>{active.subject}</h2>
              <div className="chips">
                <span className="badge neutral">{GOALS[active.goal as Goal]}</span>
              </div>
              <ul className="person-meta" style={{ marginTop: 4 }}>
                <li>
                  <MapPin size={16} aria-hidden="true" />
                  <span>{campusName(active.campus_id)}{activeSpot && ` · ${activeSpot}`}</span>
                </li>
                <li>
                  <Clock size={16} aria-hidden="true" />
                  <span><Countdown until={active.expires_at} /></span>
                </li>
              </ul>
            </div>
            <form action={checkOut}>
              <input type="hidden" name="check_in_id" value={active.id} />
              <SubmitButton className="btn-outline" pendingText="Checking out...">Check out</SubmitButton>
            </form>
          </div>
        </section>
      ) : (
        <form action={checkIn} id="check-in" className="card animate-in" style={{ scrollMarginTop: 88 }}>
          <div className="card-header">
            <span className="icon-tile accent"><Radio size={20} aria-hidden="true" /></span>
            <div>
              <h2>Check in</h2>
              <p>Tell classmates what you&apos;re working on. Your check-in ends on its own.</p>
            </div>
          </div>
          <div className="stack">
            <div className="form-grid">
              <label>
                Campus
                <select name="campus_id" required defaultValue={profile?.home_campus_id ?? ""}>
                  <option value="" disabled>Choose a campus</option>
                  <CampusOptions campuses={campuses} />
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
            <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label>
                <span>Where on campus <span className="field-hint">(optional)</span></span>
                <select name="spot" defaultValue="">
                  <option value="">Don&apos;t say</option>
                  {Object.entries(SPOTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label>
                <span>Room or area <span className="field-hint">(optional)</span></span>
                <input name="spot_detail" maxLength={60} placeholder="e.g. Room 214, 2nd floor" />
              </label>
            </div>
            <label>
              <span>Note <span className="field-hint">(optional)</span></span>
              <input name="note" maxLength={140} placeholder="e.g. working on Ch. 4, come say hi" />
            </label>
            {error && (
              <p className="alert error" role="alert">{error}</p>
            )}
            <div className="row" style={{ justifyContent: "space-between" }}>
              <p className="caption row" style={{ gap: 6, margin: 0 }}>
                <Lock size={14} aria-hidden="true" />
                Only signed-in HCC students can see where you are.
              </p>
              <SubmitButton className="btn-lg" pendingText="Checking in...">
                Check in
                <ArrowRight className="arrow" aria-hidden="true" />
              </SubmitButton>
            </div>
          </div>
        </form>
      )}

      {active && matches.length > 0 && (
        <section className="stack" aria-labelledby="matches-title">
          <div className="section-header">
            <Sparkles size={18} aria-hidden="true" style={{ color: "var(--accent-ink)", alignSelf: "center" }} />
            <h2 id="matches-title">Suggested study buddies</h2>
            <span className="badge accent">{matches.length}</span>
          </div>
          <div className="grid-cards animate-in-list">
            {matches.map((m, i) => (
              <div key={m.student.checkInId} style={{ "--i": i } as React.CSSProperties}>
                <StudentCard s={m.student} reasons={m.reasons} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="stack" aria-labelledby="now-title">
        <div className="section-header">
          <h2 id="now-title">Studying now</h2>
          <span className="badge neutral">{others.length}</span>
          <Link href="/busy-times" className="btn btn-ghost btn-sm spacer">
            <CalendarClock size={16} aria-hidden="true" />
            Busy times
          </Link>
        </div>
        <ClassmateList
          students={others.map((o) => o.student)}
          myCampus={myCampus}
          emptyAction={
            active ? (
              <Link href="/busy-times" className="btn btn-soft">See when campus is busy</Link>
            ) : (
              <a href="#check-in" className="btn">I&apos;m studying now</a>
            )
          }
        />
      </section>
    </div>
  );
}
