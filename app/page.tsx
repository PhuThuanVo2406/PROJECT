import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampuses } from "@/lib/queries";

export const dynamic = "force-dynamic";

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
  const max = Math.max(1, ...activity.map((c) => Number(c.active_count)));

  return (
    <div className="stack-lg">
      <section className="hero">
        <span className="hero-orbit" aria-hidden="true" />
        <p className="eyebrow">Study Buddy</p>
        <h1>
          Find someone to study with on your campus, <span className="text-gradient">right now.</span>
        </h1>
        <p>
          Check in when you are on campus, see who else is studying the same subject, and message them.
          We never track your exact location. Sign up with your student email.
        </p>
        <div className="row">
          <Link href="/signup" className="btn btn-lg">
            Sign up with student email
            <ArrowRight className="arrow" aria-hidden="true" />
          </Link>
          <Link href="/login" className="btn btn-outline btn-lg">Log in</Link>
        </div>
      </section>

      <section className="card stack animate-in" aria-labelledby="now-title">
        <div className="section-header">
          <span className="icon-tile accent"><Users aria-hidden="true" /></span>
          <h2 id="now-title">Studying right now</h2>
          <span className="stat spacer">{total}</span>
        </div>
        <div className="stack">
          {activity.map((c, i) => (
            <div key={c.campus_id} className="activity-row">
              <span>{c.name}</span>
              <span className="muted">{c.active_count}</span>
              <div className="activity-bar" aria-hidden="true">
                <span style={{ width: `${(Number(c.active_count) / max) * 100}%`, animationDelay: `${i * 60}ms` }} />
              </div>
            </div>
          ))}
          {activity.length === 0 && <p className="muted">Campus activity will appear here once the database is set up.</p>}
        </div>
      </section>
    </div>
  );
}
