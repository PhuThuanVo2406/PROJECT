import { test } from "node:test";
import assert from "node:assert/strict";
import { rankMatches, scoreMatch } from "./matching.ts";

const me = { subject: "Calculus", goal: "exam_prep", campusId: 1, profileSubjects: ["Math"] };

test("scores subject, goal, campus and shared courses", () => {
  const r = scoreMatch(me, { subject: "calculus ", goal: "exam_prep", campusId: 1, profileSubjects: ["math"] });
  assert.equal(r.score, 8);
  assert.deepEqual(r.reasons, ["same subject", "same goal", "same campus", "shared course list"]);
});

test("ranks best first and drops weak matches", () => {
  const ranked = rankMatches(me, [
    { id: "weak", match: { subject: "Art", goal: "homework", campusId: 9, profileSubjects: [] } },
    { id: "campus", match: { subject: "Art", goal: "homework", campusId: 1, profileSubjects: [] } },
    { id: "best", match: { subject: "Calculus", goal: "exam_prep", campusId: 2, profileSubjects: [] } },
  ]);
  assert.deepEqual(ranked.map((r) => r.id), ["best", "campus"]);
});
