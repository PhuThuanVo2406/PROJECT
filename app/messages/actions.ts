"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { REPORT_REASONS } from "@/lib/constants";

function back(otherId: string, query = "") {
  revalidatePath(`/messages/${otherId}`);
  redirect(`/messages/${otherId}${query}`);
}

export async function sendMessage(formData: FormData) {
  const { supabase, user } = await requireUser();
  const to = String(formData.get("to"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) back(to);
  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: to, body: body.slice(0, 2000) });
  back(to, error ? "?error=" + encodeURIComponent("Message not sent. You may not be able to message this student.") : "");
}

export async function blockUser(formData: FormData) {
  const { supabase, user } = await requireUser();
  const other = String(formData.get("user_id"));
  await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: other });
  revalidatePath("/messages");
  redirect("/messages?notice=" + encodeURIComponent("Student blocked."));
}

export async function unblockUser(formData: FormData) {
  const { supabase, user } = await requireUser();
  const other = String(formData.get("user_id"));
  await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", other);
  revalidatePath("/messages");
  redirect("/messages");
}

export async function reportUser(formData: FormData) {
  const { supabase, user } = await requireUser();
  const other = String(formData.get("user_id"));
  const reason = String(formData.get("reason"));
  if (!(reason in REPORT_REASONS)) back(other, "?error=" + encodeURIComponent("Pick a reason."));
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: other,
    reason,
    details: String(formData.get("details") ?? "").trim().slice(0, 1000) || null,
  });
  if (error) back(other, "?error=" + encodeURIComponent("Report not sent. Try again."));
  if (formData.get("also_block") === "on") {
    await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: other });
    revalidatePath("/messages");
    redirect("/messages?notice=" + encodeURIComponent("Report sent and student blocked."));
  }
  back(other, "?notice=" + encodeURIComponent("Report sent. An admin will review it."));
}
