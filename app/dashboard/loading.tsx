import { CardGridSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="stack-lg">
      <div className="page-header">
        <div className="stack-sm" style={{ flex: 1 }}>
          <span className="skeleton title" style={{ width: 280, maxWidth: "80%" }} />
          <span className="skeleton line" style={{ width: 360, maxWidth: "90%" }} />
        </div>
        <span className="skeleton" style={{ width: 180, height: 48, borderRadius: 10 }} />
      </div>
      <div className="grid-stats">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card stat-card" aria-hidden="true">
            <span className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div className="stack-sm" style={{ flex: 1 }}>
              <span className="skeleton line" style={{ width: "60%" }} />
              <span className="skeleton line" style={{ width: "40%", height: 20 }} />
            </div>
          </div>
        ))}
      </div>
      <CardGridSkeleton />
    </div>
  );
}
