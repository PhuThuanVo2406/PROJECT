import type { Campus } from "@/lib/types";

/** <option>s for a campus <select>, grouped by HCC college. */
export default function CampusOptions({ campuses }: { campuses: Campus[] }) {
  const colleges = [...new Set(campuses.map((c) => c.college))];
  return (
    <>
      {colleges.map((college) => (
        <optgroup key={college} label={college || "Other"}>
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
