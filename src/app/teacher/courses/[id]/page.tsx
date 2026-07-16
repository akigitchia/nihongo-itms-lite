import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseManager } from "@/components/course-manager";

export default async function TeacherCourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/teacher/courses/${params.id}`);

  const { data: course } = await supabase.from("courses").select("*").eq("id", params.id).single();
  if (!course) notFound();
  if (course.teacher_id !== user.id) redirect("/dashboard");

  const { data: sessions } = await supabase.from("sessions").select("*").eq("course_id", params.id).order("session_number");
  const { data: roster } = await supabase.from("enrollments").select("*, student:profiles(full_name, email, phone)").eq("course_id", params.id).eq("status", "approved");

  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: attendance } = sessionIds.length ? await supabase.from("attendance").select("*").in("session_id", sessionIds) : { data: [] };
  const { data: quizQuestions } = sessionIds.length
    ? await supabase.from("quiz_questions").select("*").in("session_id", sessionIds).order("sequence")
    : { data: [] };

  return (
    <CourseManager
      course={course}
      sessions={sessions ?? []}
      roster={roster ?? []}
      attendance={attendance ?? []}
      quizQuestions={quizQuestions ?? []}
      currentUserId={user.id}
    />
  );
}
