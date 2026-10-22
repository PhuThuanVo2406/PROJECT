import Link from "next/link";
import { BookOpen, Building2, MapPin, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampuses } from "@/lib/queries";
import { SPOTS, SUBJECTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const MAX_STRIP = 24;

// Placeholder drawing of a study table. To use a real photo, put it in
// public/photos/ (for example hero.jpg) and change this path to "/photos/hero.jpg".
const HERO_IMAGE = "/photos/hero-placeholder.svg";

type Activity = { campus_id: number; slug: string; name: string; active_count: number };

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const [{ data }, campuses] = await Promise.all([supabase.rpc("campus_activity"), getCampuses(supabase)]);
  const listed = new Set(campuses.map((c) => c.id));
  const activity = ((data ?? []) as Activity[]).filter((c) => listed.has(c.campus_id));
  const total = activity.reduce((n, c) => n + Number(c.active_count), 0);
  const campusCount = campuses.filter((c) => c.slug !== "online").length;

  const stats = [
    { Icon: Users, value: total, label: total === 1 ? "Student studying on campus right now" : "Students studying on campus right now" },
    { Icon: Building2, value: campusCount, label: "Campuses you can check in at, plus Online" },
    { Icon: BookOpen, value: SUBJECTS.length, label: "Subjects you can check in for" },
    { Icon: MapPin, value: Object.keys(SPOTS).length, label: "Kinds of study spots to pick from" },
  ];

  return (
    <div className="stack-lg home">
      <section className="hero">
        <div className="hero-copy animate-in">
          <span className="pill-label">For Houston Community College students</span>
          <h1>Find someone to study with on campus</h1>
          <p>
            Check in when you are on campus, see who else is studying the same subject, and message them.
            We never track your exact location. Sign up with your student email.
          </p>
          <div className="row">
            <Link href="/signup" className="btn btn-lg">Get started</Link>
            <Link href="/login" className="btn btn-outline btn-lg">Log in</Link>
          </div>
        </div>
        <figure className="hero-media notched">
          <img src={HERO_IMAGE} alt="A study table with open books, a laptop and a coffee cup" width={960} height={960} />
          <figcaption className="notch-tag">
            <span className="live-dot" aria-hidden="true" />
            <strong>{total}</strong> studying now
          </figcaption>
        </figure>
      </section>

      <section className="home-section" aria-labelledby="numbers-title">
        <div className="section-intro">
          <span className="pill-label"><span className="live-dot" aria-hidden="true" />Live on campus</span>
          <h2 id="numbers-title">Who&apos;s studying right now</h2>
          <p>Counts update as students check in and out. Check-ins end on their own, so these are real people on campus today.</p>
        </div>
        <ul className="home-stats">
          {stats.map(({ Icon, value, label }) => (
            <li key={label} className="home-stat">
              <span className="home-stat-top">
                <Icon aria-hidden="true" />
                <strong className="home-stat-value">{value}</strong>
              </span>
              <span className="home-stat-label">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack" aria-labelledby="now-title">
        <div className="section-header">
          <h2 id="now-title">By campus</h2>
          <span className="badge accent">{total}</span>
        </div>
        {activity.length === 0 ? (
          <p className="muted">Campus activity will appear here once the database is set up.</p>
        ) : (
          <ul className="campus-list">
            {activity.map((c) => {
              const n = Number(c.active_count);
              return (
                <li key={c.campus_id} className={n > 0 ? "campus-row active" : "campus-row"}>
                  <span className="name">{c.name}</span>
                  <span className="count">{n}</span>
                  <span className="window-strip" aria-hidden="true">
                    {Array.from({ length: Math.min(n, MAX_STRIP) }, (_, i) => <span key={i} />)}
                    {n > MAX_STRIP && <span className="more">+{n - MAX_STRIP}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
