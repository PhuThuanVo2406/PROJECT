import Link from "next/link";
import { Users } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { getCampuses } from "@/lib/queries";
import CampusOptions from "@/components/CampusOptions";

const DAYS = [
  { dow: 1, label: "Mon" },
  { dow: 2, label: "Tue" },
  { dow: 3, label: "Wed" },
  { dow: 4, label: "Thu" },
  { dow: 5, label: "Fri" },
  { dow: 6, label: "Sat" },
  { dow: 0, label: "Sun" },
];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

function hourLabel(h: number) {
  const suffix = h < 12 ? "a" : "p";
  return `${h % 12 === 0 ? 12 : h % 12}${suffix}`;
}

type Slot = { dow: number; hour: number; check_ins: number };

export default async function BusyTimes({ searchParams }: { searchParams: Promise<{ campus?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const campuses = await getCampuses(supabase);
  const campusId = sp.campus ? Number(sp.campus) : null;

  const { data, error } = await supabase.rpc("busy_times", { p_campus_id: campusId, p_days: 28 });
  const counts = new Map(((data ?? []) as Slot[]).map((s) => [`${s.dow}-${s.hour}`, Number(s.check_ins)]));
  const max = Math.max(0, ...counts.values());
  const campusName = campuses.find((c) => c.id === campusId)?.name ?? "All campuses";

  return (
    <div className="stack-lg">
      <header className="page-header animate-in">
        <div>
          <p className="eyebrow">Planner / Last 4 weeks</p>
          <h1>Busy times</h1>
          <p>
            How many students were checked in at each hour over the last 4 weeks (Houston time). Use it to pick
            a time when classmates are around.
          </p>
        </div>
        <Link href="/study-now" className="btn btn-outline">
          <Users size={18} aria-hidden="true" />
          Who&apos;s studying now
        </Link>
      </header>

      <form className="card row animate-in" method="get" style={{ alignItems: "flex-end" }}>
        <label style={{ flex: 1, minWidth: 220 }}>
          Campus
          <select name="campus" defaultValue={sp.campus ?? ""}>
            <option value="">All campuses</option>
            <CampusOptions campuses={campuses} />
          </select>
        </label>
        <button type="submit">Show</button>
      </form>

      <section className="card stack animate-in">
        <h2>{campusName}</h2>
        {error && <p className="error">Could not load busy times.</p>}
        {!error && max === 0 && (
          <p className="muted">No check-ins here in the last 4 weeks yet. Be the first to check in.</p>
        )}
        {!error && max > 0 && (
          <>
            <div className="heatmap-scroll">
              <table className="heatmap">
                <caption className="sr-only">Check-ins by weekday and hour at {campusName}</caption>
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Day</span></th>
                    {HOURS.map((h) => <th key={h} scope="col">{hourLabel(h)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((d) => (
                    <tr key={d.dow}>
                      <th scope="row">{d.label}</th>
                      {HOURS.map((h) => {
                        const n = counts.get(`${d.dow}-${h}`) ?? 0;
                        const pct = n === 0 ? 0 : Math.round(15 + (85 * n) / max);
                        const label = `${d.label} ${hourLabel(h)}m: ${n} check-in${n === 1 ? "" : "s"}`;
                        return (
                          <td
                            key={h}
                            title={label}
                            style={{ background: n === 0 ? undefined : `color-mix(in srgb, var(--accent) ${pct}%, var(--surface))` }}
                          >
                            <span className="sr-only">{label}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row muted" aria-hidden="true">
              <span>Fewer</span>
              {[0, 15, 43, 71, 100].map((p) => (
                <span
                  key={p}
                  className="heatmap-swatch"
                  style={{ background: p === 0 ? undefined : `color-mix(in srgb, var(--accent) ${p}%, var(--surface))` }}
                />
              ))}
              <span>More (busiest hour: {max})</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
