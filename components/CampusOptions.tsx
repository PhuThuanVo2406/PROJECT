import type { Campus } from "@/lib/types";

/** <option>s for a campus <select>, grouped by college. */
// College names are stored as "HCC Central" etc.; the site leaves out the abbreviation.
const collegeLabel = (college: string) => college.replace(/^HCC\s+/i, "") || "Other";
export default function CampusOptions({ campuses }: { campuses: Campus[] }) {
  const colleges = [...new Set(campuses.map((c) => c.college))];
  return (
    <>
      {colleges.map((college) => (
        <optgroup key={college} label={collegeLabel(college)}>
          {campuses
            .filter((c) => c.college === college)
            .map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </optgroup>
      ))}
    </>
  );
}
