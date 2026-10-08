"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { SUBJECTS } from "@/lib/constants";

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 40);
  if (!displayName) redirect("/profile?error=" + encodeURIComponent("Display name is required."));

  const allowed = new Set<string>(SUBJECTS);
  const subjects = formData.getAll("subjects").map(String).filter((s) => allowed.has(s)).slice(0, 8);
  const campus = Number(formData.get("home_campus_id"));

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      major: String(formData.get("major") ?? "").trim().slice(0, 60) || null,
      bio: String(formData.get("bio") ?? "").trim().slice(0, 280) || null,
      subjects,
      home_campus_id: campus || null,
      is_visible: formData.get("is_visible") === "on",
    })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect(error ? "/profile?error=" + encodeURIComponent(error.message) : "/profile?saved=1");
}
