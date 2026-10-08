/** Placeholder shapes shown while a list of classmates loads. */
export function CardSkeleton() {
  return (
    <div className="card person-card" aria-hidden="true">
      <div className="person-head">
        <span className="skeleton circle" style={{ width: 44, height: 44 }} />
        <div className="stack-sm" style={{ flex: 1 }}>
          <span className="skeleton line" style={{ width: "60%" }} />
          <span className="skeleton line" style={{ width: "35%" }} />
        </div>
      </div>
      <div className="row">
        <span className="skeleton" style={{ width: 72, height: 22, borderRadius: 999 }} />
        <span className="skeleton" style={{ width: 90, height: 22, borderRadius: 999 }} />
      </div>
      <div className="stack-sm">
        <span className="skeleton line" style={{ width: "70%" }} />
        <span className="skeleton line" style={{ width: "85%" }} />
      </div>
      <span className="skeleton" style={{ height: 44, borderRadius: 10 }} />
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid-cards" role="status" aria-label="Loading classmates">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
