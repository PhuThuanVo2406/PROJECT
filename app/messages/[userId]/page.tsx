import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { REPORT_REASONS } from "@/lib/constants";
import LiveRefresh from "@/components/LiveRefresh";
import type { Message } from "@/lib/types";
import { blockUser, reportUser, sendMessage } from "../actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Thread({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { userId: otherId } = await params;
  const { error, notice } = await searchParams;
  if (!UUID.test(otherId)) notFound();
  const { supabase, user } = await requireUser();
  if (otherId === user.id) notFound();

  // RLS returns nothing if the student is hidden (and you have not talked) or blocked.
  const { data: other } = await supabase
    .from("profiles")
    .select("id, display_name, major")
    .eq("id", otherId)
    .maybeSingle();
  if (!other) {
    return (
      <div className="card">
        <p>This student is not available.</p>
        <Link href="/messages">Back to messages</Link>
      </div>
    );
  }

  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true })
    .limit(500);
  const messages = (data ?? []) as Message[];

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("sender_id", otherId)
    .is("read_at", null);

  return (
    <div className="stack">
      <LiveRefresh userId={user.id} />
      <div className="row">
        <Link href="/messages">← Messages</Link>
        <h1 style={{ margin: 0 }}>{other.display_name}</h1>
        {other.major && <span className="muted">{other.major}</span>}
      </div>

      <section className="card">
        <div className="thread">
          {messages.length === 0 && <p className="muted">Say hi and suggest where to meet on campus.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.sender_id === user.id ? "mine" : ""}`}>
              {m.body}
              <time dateTime={m.created_at}>{new Date(m.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "short", timeStyle: "short" })}</time>
            </div>
          ))}
        </div>
        <form action={sendMessage} className="row">
          <input type="hidden" name="to" value={otherId} />
          <input name="body" required maxLength={2000} placeholder="Write a message" autoComplete="off" style={{ flex: 1 }} />
          <button type="submit">Send</button>
        </form>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
      </section>

      <details className="card">
        <summary>Safety: block or report</summary>
        <div className="stack" style={{ marginTop: "0.75rem" }}>
          <form action={blockUser} className="row">
            <input type="hidden" name="user_id" value={otherId} />
            <span className="muted" style={{ marginRight: "auto" }}>Blocking hides you from each other and stops messages.</span>
            <button className="secondary" type="submit">Block</button>
          </form>
          <form action={reportUser} className="stack">
            <input type="hidden" name="user_id" value={otherId} />
            <label>
              Reason
              <select name="reason" required defaultValue="">
                <option value="" disabled>Choose a reason</option>
                {Object.entries(REPORT_REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>
              Details (optional)
              <textarea name="details" maxLength={1000} rows={3} />
            </label>
            <label className="inline">
              <input type="checkbox" name="also_block" defaultChecked /> Also block this student
            </label>
            <button type="submit">Send report</button>
          </form>
        </div>
      </details>
    </div>
  );
}
