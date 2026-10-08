import { requireUser } from "@/lib/supabase/server";
import CampusOptions from "@/components/CampusOptions";
import { STUDY_STYLES, SUBJECTS } from "@/lib/constants";
import { getCampuses } from "@/lib/queries";
import type { Profile } from "@/lib/types";
import { updateProfile } from "./actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const { supabase, user } = await requireUser();
  const [{ data: profile }, campuses, { count }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    getCampuses(supabase),
    supabase.from("check_ins").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  if (!profile) return <p>Profile not found.</p>;

  return (
    <form action={updateProfile} className="card stack" style={{ maxWidth: 640 }}>
      <h1>Your profile</h1>
      <p className="muted">{user.email} · {count ?? 0} check-ins so far</p>
      <label>
        Display name
        <input name="display_name" required maxLength={40} defaultValue={profile.display_name} />
      </label>
      <label>
        Major or program
        <input name="major" maxLength={60} defaultValue={profile.major ?? ""} />
      </label>
      <label>
        Home campus
        <select name="home_campus_id" defaultValue={profile.home_campus_id ?? ""}>
          <option value="">Not set</option>
          <CampusOptions campuses={campuses} />
        </select>
      </label>
      <fieldset className="card" style={{ margin: 0 }}>
        <legend>Subjects you take (up to 8)</legend>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.4rem" }}>
          {SUBJECTS.map((s) => (
            <label key={s} className="inline">
              <input type="checkbox" name="subjects" value={s} defaultChecked={profile.subjects.includes(s)} /> {s}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="card" style={{ margin: 0 }}>
        <legend>How you like to study</legend>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.4rem" }}>
          {Object.entries(STUDY_STYLES).map(([k, v]) => (
            <label key={k} className="inline">
              <input type="checkbox" name="study_styles" value={k} defaultChecked={(profile.study_styles ?? []).includes(k)} /> {v}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Short bio
        <textarea name="bio" maxLength={280} rows={3} defaultValue={profile.bio ?? ""} />
      </label>
      <label className="inline" id="privacy">
        <input type="checkbox" name="is_visible" defaultChecked={profile.is_visible} />
        Show me to other students when I check in
      </label>
      <p className="muted">
        When this is off you do not appear in Studying now, matches, or campus counts. We only ever share
        your campus, never your exact location.
      </p>
      {error && <p className="error">{error}</p>}
      {saved && <p className="notice">Saved.</p>}
      <button type="submit">Save</button>
    </form>
  );
}
