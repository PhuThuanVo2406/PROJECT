import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActiveStudent } from "@/components/StudentCard";
import type { Campus, CheckIn, Profile } from "./types";

export async function getCampuses(supabase: SupabaseClient) {
  const { data } = await supabase.from("campuses").select("id, slug, name, college, sort_order")
    // Campuses without a college are retired ones kept only for old records.
    .neq("college", "")
    .order("sort_order").order("name");
  return (data ?? []) as Campus[];
}

export async function getMyActiveCheckIn(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .is("ended_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as CheckIn | null;
}

type Row = CheckIn & { profiles: Pick<Profile, "display_name" | "major" | "subjects"> | null };

/** Other students' active check-ins (RLS hides hidden and blocked students). */
export async function getActiveStudents(
  supabase: SupabaseClient,
  userId: string,
  campuses: Campus[],
  filters: { campusId?: number; subject?: string; goal?: string } = {},
) {
  let q = supabase
    .from("check_ins")
    .select("*, profiles(display_name, major, subjects)")
    .neq("user_id", userId)
    .is("ended_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("started_at", { ascending: false })
    .limit(100);
  if (filters.campusId) q = q.eq("campus_id", filters.campusId);
  if (filters.subject) q = q.eq("subject", filters.subject);
  if (filters.goal) q = q.eq("goal", filters.goal);

  const { data } = await q;
  const campusName = new Map(campuses.map((c) => [c.id, c.name]));
  return ((data ?? []) as Row[])
    .filter((r) => r.profiles)
    .map((r) => ({
      student: {
        checkInId: r.id,
        userId: r.user_id,
        name: r.profiles!.display_name,
        major: r.profiles!.major,
        campus: campusName.get(r.campus_id) ?? "HCC",
        subject: r.subject,
        goal: r.goal,
        note: r.note,
        expiresAt: r.expires_at,
      } satisfies ActiveStudent,
      profileSubjects: r.profiles!.subjects ?? [],
      campusId: r.campus_id,
    }));
}
