"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";

const STATUSES = ["open", "reviewed", "actioned", "dismissed"];

export async function updateReport(formData: FormData) {
  const { supabase, user } = await requireUser();
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status)) return;
  // RLS only lets admins update reports.
  await supabase
    .from("reports")
    .update({
      status,
      admin_note: String(formData.get("admin_note") ?? "").trim().slice(0, 1000) || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", Number(formData.get("report_id")));
  revalidatePath("/admin");
}
