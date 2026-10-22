import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import LiveRefresh from "@/components/LiveRefresh";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import RelativeTime from "@/components/ui/RelativeTime";
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
  const shown = [...convos.entries()].filter(([id]) => !blockedIds.has(id) && names.has(id));

  return (
    <div className="stack-lg">
      <LiveRefresh userId={user.id} />
      <header className="page-header animate-in">
        <div>
          <h1>Messages</h1>
        </div>
      </header>
      {notice && <p className="alert success">{notice}</p>}
      {convos.size === 0 ? (
        <EmptyState
          icon={<MessageCircle size={26} />}
          title="No conversations yet"
          action={<Link href="/study-now" className="btn">Go to Studying now</Link>}
        >
          Find someone in Studying now and say hi.
        </EmptyState>
      ) : (
        <ul className="convo-list animate-in">
          {shown.map(([id, c]) => (
            <li key={id}>
              <Link href={`/messages/${id}`} className={c.unread > 0 ? "convo unread" : "convo"}>
                <Avatar name={names.get(id)!} seed={id} />
                <div className="convo-body">
                  <div className="convo-top">
                    <span className="convo-name">{names.get(id)}</span>
                    {c.unread > 0 && <span className="badge accent">{c.unread} new</span>}
                    <span className="caption spacer"><RelativeTime since={c.last.created_at} /></span>
                  </div>
                  <p className="convo-preview">
                    {c.last.sender_id === user.id ? "You: " : ""}
                    {c.last.body}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {blocks && blocks.length > 0 && (
        <details className="card">
          <summary>Blocked students ({blocks.length})</summary>
          {blocks.map((b) => {
            const p = b.profiles as unknown as { display_name: string } | null;
            return (
              <form key={b.blocked_id as string} action={unblockUser} className="row convo-blocked">
                <input type="hidden" name="user_id" value={b.blocked_id as string} />
                <span className="grow">{p?.display_name ?? "Student"}</span>
                <button className="secondary btn-sm" type="submit">Unblock</button>
              </form>
            );
          })}
        </details>
      )}
    </div>
  );
}
