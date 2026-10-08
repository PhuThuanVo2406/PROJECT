import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { REPORT_REASONS } from "@/lib/constants";
import { updateReport } from "./actions";

type Stats = {
  total_students: number;
  new_students_7d: number;
  active_now: number;
  check_ins_7d: number;
  messages_7d: number;
  open_reports: number;
};

type ReportRow = {
  id: number;
  reason: keyof typeof REPORT_REASONS;
  details: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  reporter: { display_name: string } | null;
  reported: { display_name: string } | null;
};

export default async function Admin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "open" } = await searchParams;
  const { supabase, user } = await requireUser();
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const [{ data: statsRows }, { data: reports }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase
      .from("reports")
      .select(
        "id, reason, details, status, admin_note, created_at, reporter:profiles!reports_reporter_id_fkey(display_name), reported:profiles!reports_reported_id_fkey(display_name)",
      )
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  const stats = (statsRows?.[0] ?? null) as Stats | null;

  const tiles: [string, keyof Stats][] = [
    ["Students", "total_students"],
    ["New this week", "new_students_7d"],
    ["Checked in now", "active_now"],
    ["Check-ins this week", "check_ins_7d"],
    ["Messages this week", "messages_7d"],
    ["Open reports", "open_reports"],
  ];

  return (
    <div className="stack">
      <h1>Admin</h1>
      <div className="grid">
        {tiles.map(([label, key]) => (
          <div key={key} className="card" style={{ marginBottom: 0 }}>
            <div className="muted">{label}</div>
            <div className="stat">{stats ? stats[key] : "–"}</div>
          </div>
        ))}
      </div>

      <section className="card">
        <div className="row">
          <h2 style={{ marginRight: "auto" }}>Reports</h2>
          {["open", "reviewed", "actioned", "dismissed"].map((s) => (
            <a key={s} href={`/admin?status=${s}`} className={s === status ? "badge" : "muted"}>{s}</a>
          ))}
        </div>
        {(reports ?? []).length === 0 ? (
          <p className="muted">No {status} reports.</p>
        ) : (
          <table>
            <thead>
              <tr><th>When</th><th>Reported</th><th>By</th><th>Reason</th><th>Action</th></tr>
            </thead>
            <tbody>
              {(reports as unknown as ReportRow[]).map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{r.reported?.display_name ?? "?"}</td>
                  <td>{r.reporter?.display_name ?? "?"}</td>
                  <td>
                    {REPORT_REASONS[r.reason] ?? r.reason}
                    {r.details && <div className="muted">{r.details}</div>}
                  </td>
                  <td>
                    <form action={updateReport} className="stack">
                      <input type="hidden" name="report_id" value={r.id} />
                      <select name="status" defaultValue={r.status}>
                        <option value="open">Open</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="actioned">Actioned</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                      <input name="admin_note" placeholder="Note" defaultValue={r.admin_note ?? ""} maxLength={1000} />
                      <button type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
