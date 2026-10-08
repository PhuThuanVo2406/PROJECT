// Rule-based study buddy matching. Pure function so it is easy to test.

export type MatchInput = {
  subject: string;
  goal: string;
  campusId: number;
  profileSubjects: string[];
};

export type MatchReason = "same subject" | "same goal" | "same campus" | "shared course list";

export function scoreMatch(me: MatchInput, other: MatchInput) {
  let score = 0;
  const reasons: MatchReason[] = [];
  const norm = (s: string) => s.trim().toLowerCase();

  if (norm(me.subject) === norm(other.subject)) {
    score += 3;
    reasons.push("same subject");
  }
  if (me.goal === other.goal) {
    score += 2;
    reasons.push("same goal");
  }
  if (me.campusId === other.campusId) {
    score += 2;
    reasons.push("same campus");
  }
  const mine = new Set(me.profileSubjects.map(norm));
  if (other.profileSubjects.some((s) => mine.has(norm(s)))) {
    score += 1;
    reasons.push("shared course list");
  }
  return { score, reasons };
}

/** Ranks candidates best-first, dropping anyone with no overlap at all. */
export function rankMatches<T extends { match: MatchInput }>(me: MatchInput, candidates: T[], limit = 5) {
  return candidates
    .map((c) => ({ ...c, ...scoreMatch(me, c.match) }))
    .filter((c) => c.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
