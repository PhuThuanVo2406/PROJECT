import type { Goal } from "./constants";

export type Campus = { id: number; slug: string; name: string };

export type Profile = {
  id: string;
  display_name: string;
  major: string | null;
  bio: string | null;
  subjects: string[];
  home_campus_id: number | null;
  is_visible: boolean;
  is_admin: boolean;
  created_at: string;
};

export type CheckIn = {
  id: number;
  user_id: string;
  campus_id: number;
  subject: string;
  goal: Goal;
  note: string | null;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
};

export type Message = {
  id: number;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};
