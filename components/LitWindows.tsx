const COLUMNS = 6;
const ROWS = 4;
const WINDOWS = COLUMNS * ROWS;

// Windows light up in this scattered order, so a few students look like a
// few lit rooms rather than a filled-in row.
const ORDER = [9, 2, 16, 21, 5, 12, 19, 0, 14, 7, 23, 3, 17, 10, 1, 20, 6, 13, 22, 4, 15, 8, 18, 11];

/** A small campus building with one lit window for each student checked in right now. */
export default function LitWindows({ count }: { count: number }) {
  const lit = new Map(ORDER.slice(0, Math.min(count, WINDOWS)).map((w, i) => [w, i]));
  return (
    <figure className="building">
      <div className="building-face" aria-hidden="true">
        <div className="windows">
          {Array.from({ length: WINDOWS }, (_, w) => (
            <span
              key={w}
              className={lit.has(w) ? "window lit" : "window"}
              style={lit.has(w) ? ({ "--i": lit.get(w) } as React.CSSProperties) : undefined}
            />
          ))}
        </div>
        <div className="building-door" />
      </div>
      <div className="building-ground" aria-hidden="true" />
      <figcaption>
        <strong>{count}</strong>
        <span>{count === 1 ? "student is studying on campus right now" : "students are studying on campus right now"}</span>
      </figcaption>
    </figure>
  );
}
