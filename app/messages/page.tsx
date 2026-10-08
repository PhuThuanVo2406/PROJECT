import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import LiveRefresh from "@/components/LiveRefresh";
import type { Message } from "@/lib/types";
import { unblockUser } from "./actions";

export default async function Inbox({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(300);
  const messages = (data ?? []) as Message[];

  const convos = new Map<string, { last: Message; unread: number }>();
  for (const m of messages) {
    const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    const c = convos.get(other) ?? { last: m, unread: 0 };
    if (m.recipient_id === user.id && !m.read_at) c.unread++;
    convos.set(other, c);
  }

  const [{ data: profiles }, { data: blocks }] = await Promise.all([
    supabase.from("profiles").select("id, display_name").in("id", [...convos.keys()]),
    supabase.from("blocks").select("blocked_id, profiles!blocks_blocked_id_fkey(display_name)").eq("blocker_id", user.id),
  ]);
  const names = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string]));
  const blockedIds = new Set((blocks ?? []).map((b) => b.blocked_id as string));

  return (
    <div className="stack">
      <LiveRefresh userId={user.id} />
      <h1>Messages</h1>
      {notice && <p className="notice">{notice}</p>}
      {convos.size === 0 && <p className="muted">No conversations yet. Find someone in Studying now.</p>}
      {[...convos.entries()]
        .filter(([id]) => !blockedIds.has(id) && names.has(id))
        .map(([id, c]) => (
          <Link key={id} href={`/messages/${id}`} className="card row" style={{ textDecoration: "none", color: "inherit" }}>
            <strong>{names.get(id)}</strong>
            {c.unread > 0 && <span className="badge warn">{c.unread} new</span>}
            <span className="muted" style={{ marginLeft: "auto", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
              {c.last.sender_id === user.id ? "You: " : ""}
              {c.last.body}
            </span>
          </Link>
        ))}

      {blocks && blocks.length > 0 && (
        <details className="card">
          <summary>Blocked students ({blocks.length})</summary>
          {blocks.map((b) => {
            const p = b.profiles as unknown as { display_name: string } | null;
            return (
              <form key={b.blocked_id as string} action={unblockUser} className="row" style={{ marginTop: "0.5rem" }}>
                <input type="hidden" name="user_id" value={b.blocked_id as string} />
                <span style={{ marginRight: "auto" }}>{p?.display_name ?? "Student"}</span>
                <button className="secondary" type="submit">Unblock</button>
              </form>
            );
          })}
        </details>
      )}
    </div>
  );
}
