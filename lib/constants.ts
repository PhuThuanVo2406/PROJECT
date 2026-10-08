export const STUDENT_EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN || "student.hccs.edu";

export function isStudentEmail(email: string, domain = STUDENT_EMAIL_DOMAIN) {
  return email.trim().toLowerCase().endsWith("@" + domain.toLowerCase());
}

export const SUBJECTS = [
  "Math",
  "English",
  "Biology",
  "Chemistry",
  "Physics",
  "Anatomy & Physiology",
  "History",
  "Government",
  "Psychology",
  "Computer Science",
  "Accounting",
  "Economics",
  "Spanish",
  "Nursing",
  "Other",
] as const;

// Keys must match the check constraint on check_ins.goal.
export const GOALS = {
  homework: "Homework",
  exam_prep: "Exam prep",
  group_project: "Group project",
  quiet_cowork: "Quiet co-studying",
  tutoring: "Looking for help",
} as const;

export type Goal = keyof typeof GOALS;

export const DURATIONS = [30, 60, 90, 120, 180] as const;

export const REPORT_REASONS = {
  harassment: "Harassment",
  spam: "Spam",
  inappropriate: "Inappropriate content",
  safety: "Safety concern",
  other: "Other",
} as const;

export function isGoal(value: string): value is Goal {
  return Object.prototype.hasOwnProperty.call(GOALS, value);
}
