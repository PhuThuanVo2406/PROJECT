import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampuses } from "@/lib/queries";
import LitWindows from "@/components/LitWindows";

export const dynamic = "force-dynamic";

const MAX_STRIP = 24;

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

  return (
    <div className="stack-lg">
      <section className="hero">
        <div>
          <h1>Find someone to study with on your campus, right now.</h1>
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
        </div>
        <LitWindows count={total} />
      </section>

      <section className="stack" aria-labelledby="now-title">
        <div className="section-header">
          <h2 id="now-title">Studying right now</h2>
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
