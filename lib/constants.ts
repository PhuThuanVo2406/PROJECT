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

// Keys must match the check constraint on check_ins.spot.
export const SPOTS = {
  library: "Library",
  tutoring_center: "Tutoring / learning center",
  student_lounge: "Student lounge",
  cafeteria: "Cafeteria",
  classroom: "Classroom",
  computer_lab: "Computer lab",
  outdoors: "Outdoors",
  other: "Somewhere else",
} as const;

export type Spot = keyof typeof SPOTS;

export function isSpot(value: string): value is Spot {
  return Object.prototype.hasOwnProperty.call(SPOTS, value);
}

export const STUDY_STYLES = {
  quiet: "Quiet, heads down",
  discussion: "Talk it through",
  pomodoro: "Pomodoro breaks",
  music: "Music is fine",
  quiz: "Quiz each other",
  whiteboard: "Whiteboard problems",
} as const;

export type StudyStyle = keyof typeof STUDY_STYLES;

const TIME_ZONE = "America/Chicago";

/** "3:45 PM · 20 min ago" for a check-in start time. */
export function formatStarted(iso: string, now = Date.now()) {
  const at = new Date(iso);
  const clock = at.toLocaleTimeString("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });
  const mins = Math.max(0, Math.round((now - at.getTime()) / 60000));
  const ago = mins < 1 ? "just now" : mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} hr ${mins % 60} min ago`;
  return `${clock} · ${ago}`;
}
