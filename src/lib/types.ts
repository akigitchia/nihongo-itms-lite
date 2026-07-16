export type UserRole = "teacher" | "student";
export type EnrollmentStatus = "pending" | "approved" | "rejected";
export type SessionStatus = "scheduled" | "live" | "completed" | "cancelled";
export type CourseFormat = "live" | "self_paced";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  level: string;
  description: string | null;
  schedule_text: string;
  teacher_id: string;
  max_students: number;
  status: "open" | "closed";
  created_at: string;
  course_format: CourseFormat;
  price: number | null;
  payment_note: string | null;
  teacher?: Profile;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  created_at: string;
  student?: Profile;
  course?: Course;
}

export interface ClassSession {
  id: string;
  course_id: string;
  session_number: number;
  title: string | null;
  session_date: string | null;
  duration_minutes: number;
  meeting_link: string | null;
  materials_link: string | null;
  status: SessionStatus;
  course?: Course;
}

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  joined_at: string | null;
  left_at: string | null;
  student?: Profile;
}

export interface Message {
  id: string;
  course_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export const LEVELS = [
  "Foundation Japanese (Pre-N5)",
  "Beginner 1 (N5)",
  "Beginner 2 (N5)",
  "Elementary 1 (N4)",
  "Elementary 2 (N4)",
  "Intermediate 1 (N3)",
  "Intermediate 2 (N3)",
  "Upper Intermediate (N2)",
  "Advanced Japanese (N2–N1)",
  "Japanese for ITMS Professionals",
];
