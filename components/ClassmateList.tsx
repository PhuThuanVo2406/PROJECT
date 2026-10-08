"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search, SearchX, Users } from "lucide-react";
import StudentCard, { type ActiveStudent } from "./StudentCard";
import EmptyState from "./ui/EmptyState";

/** Classmates studying now, with a search box and campus/subject filters (filters run in the browser). */
export default function ClassmateList({
  students,
  myCampus,
  emptyAction,
}: {
  students: ActiveStudent[];
  myCampus: string | null;
  emptyAction?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [campus, setCampus] = useState("");
  const [subject, setSubject] = useState("");

  const campuses = useMemo(() => [...new Set(students.map((s) => s.campus))].sort(), [students]);
  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) counts.set(s.subject, (counts.get(s.subject) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [students]);

  const q = query.trim().toLowerCase();
  const shown = students.filter(
    (s) =>
      (!campus || s.campus === campus) &&
      (!subject || s.subject === subject) &&
      (!q || [s.name, s.subject, s.campus, s.major, s.note, s.spotDetail].some((v) => v?.toLowerCase().includes(q))),
  );

  if (students.length === 0) {
    return (
      <EmptyState icon={<Users size={26} />} title="Nobody is checked in right now" action={emptyAction}>
        Be the first. When you check in, classmates on your campus can find you and say hi.
      </EmptyState>
    );
  }

  const clear = () => {
    setQuery("");
    setCampus("");
    setSubject("");
  };

  return (
    <div className="stack">
      <div className="toolbar" role="search">
        <div className="search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classmates"
            aria-label="Search classmates"
          />
        </div>
        <div className="chips" aria-label="Filters">
          {myCampus && campuses.includes(myCampus) && (
            <button
              type="button"
              className="chip"
              aria-pressed={campus === myCampus}
              onClick={() => setCampus(campus === myCampus ? "" : myCampus)}
            >
              My campus
            </button>
          )}
          <select
            className="chip"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            aria-label="Filter by campus"
          >
            <option value="">All campuses</option>
            {campuses.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button type="button" className="chip" aria-pressed={!subject} onClick={() => setSubject("")}>
            All subjects
          </button>
          {subjects.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={subject === name}
              onClick={() => setSubject(subject === name ? "" : name)}
            >
              {name} <span className="count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<SearchX size={26} />}
          title="No classmates match"
          action={<button type="button" className="btn-outline" onClick={clear}>Clear filters</button>}
        >
          Try a different search, or widen the campus or subject.
        </EmptyState>
      ) : (
        <div className="grid-cards animate-in-list" aria-live="polite">
          {shown.map((s, i) => (
            <div key={s.checkInId} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
              <StudentCard s={s} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
