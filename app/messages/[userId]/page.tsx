import Link from "next/link";
import { ArrowLeft, Send, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { REPORT_REASONS } from "@/lib/constants";
import LiveRefresh from "@/components/LiveRefresh";
import Avatar from "@/components/ui/Avatar";
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
      <div className="empty">
        <h3>This student is not available.</h3>
        <Link href="/messages" className="btn btn-outline">Back to messages</Link>
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
      <Link href="/messages" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Messages
      </Link>
      <header className="chat-head animate-in">
        <Avatar name={other.display_name} seed={other.id} />
        <div className="grow">
          <h1>{other.display_name}</h1>
          {other.major && <p className="muted">{other.major}</p>}
        </div>
      </header>

      <section className="card chat" aria-label={`Conversation with ${other.display_name}`}>
        <div className="thread">
          {messages.length === 0 && <p className="muted thread-empty">Say hi and suggest where to meet on campus.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.sender_id === user.id ? "mine" : ""}`}>
              {m.body}
              <time dateTime={m.created_at}>{new Date(m.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "short", timeStyle: "short" })}</time>
            </div>
          ))}
        </div>
        {error && <p className="alert error" role="alert">{error}</p>}
        {notice && <p className="alert success">{notice}</p>}
        <form action={sendMessage} className="composer">
          <input type="hidden" name="to" value={otherId} />
          <input name="body" required maxLength={2000} placeholder="Write a message" autoComplete="off" aria-label="Message" />
          <button type="submit">
            <Send aria-hidden="true" />
            Send
          </button>
        </form>
      </section>

      <details className="card">
        <summary>
          <ShieldAlert size={18} aria-hidden="true" />
          Safety: block or report
        </summary>
        <div className="stack safety">
          <form action={blockUser} className="row">
            <input type="hidden" name="user_id" value={otherId} />
            <span className="muted grow">Blocking hides you from each other and stops messages.</span>
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
            <button type="submit" className="btn-danger align-start">Send report</button>
          </form>
        </div>
      </details>
    </div>
  );
}
