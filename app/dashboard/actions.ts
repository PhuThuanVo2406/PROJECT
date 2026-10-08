"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { DURATIONS, isGoal } from "@/lib/constants";

export async function checkIn(formData: FormData) {
  const { supabase } = await requireUser();
  const campusId = Number(formData.get("campus_id"));
  const subject = String(formData.get("subject") ?? "").trim();
  const goal = String(formData.get("goal") ?? "");
  const minutes = Number(formData.get("minutes"));
  const note = String(formData.get("note") ?? "").trim();

  if (!campusId || !subject || !isGoal(goal) || !DURATIONS.includes(minutes as (typeof DURATIONS)[number])) {
    redirect("/dashboard?error=" + encodeURIComponent("Pick a campus, subject, goal and duration."));
  }

  const { error } = await supabase.rpc("start_check_in", {
    p_campus_id: campusId,
    p_subject: subject,
    p_goal: goal,
    p_minutes: minutes,
    p_note: note || null,
  });
  if (error) redirect("/dashboard?error=" + encodeURIComponent(error.message));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function checkOut(formData: FormData) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("check_ins")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", Number(formData.get("check_in_id")))
    .eq("user_id", user.id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
