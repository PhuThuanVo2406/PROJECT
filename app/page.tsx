import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Activity = { campus_id: number; slug: string; name: string; active_count: number };

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const { data } = await supabase.rpc("campus_activity");
  const activity = (data ?? []) as Activity[];
  const total = activity.reduce((n, c) => n + Number(c.active_count), 0);
  const max = Math.max(1, ...activity.map((c) => Number(c.active_count)));

  return (
    <div className="stack">
      <section className="card">
        <h1>Find someone to study with, on your HCC campus, right now.</h1>
        <p className="muted">
          Check in when you are on campus, see who else is studying the same subject, and message them.
          Only your campus is shared, never your exact location. Sign up with your HCC student email.
        </p>
        <div className="row">
          <Link href="/signup" className="button">Sign up with student email</Link>
          <Link href="/login" className="button secondary">Log in</Link>
        </div>
      </section>

      <section className="card">
        <div className="row">
          <h2 style={{ marginRight: "auto" }}>Studying right now</h2>
          <span className="stat">{total}</span>
        </div>
        <div className="stack">
          {activity.map((c) => (
            <div key={c.campus_id}>
              <div className="row">
                <span style={{ marginRight: "auto" }}>{c.name}</span>
                <span className="muted">{c.active_count}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--border)" }}>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: `${(Number(c.active_count) / max) * 100}%`,
                    background: "var(--brand)",
                  }}
                />
              </div>
            </div>
          ))}
          {activity.length === 0 && <p className="muted">Campus activity will appear here once the database is set up.</p>}
        </div>
      </section>
    </div>
  );
}
