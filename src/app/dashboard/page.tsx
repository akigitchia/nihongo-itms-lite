import { createClient } from "@/lib/supabase/server";
import { StudentDashboard } from "@/components/student-dashboard";
import { TeacherDashboard } from "@/components/teacher-dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;

  if (profile.role === "teacher") {
    const { data: courses } = await supabase.from("courses").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false });
    const courseIds = (courses ?? []).map((c) => c.id);

    const { data: pendingEnrollments } = courseIds.length
      ? await supabase.from("enrollments").select("*, student:profiles(full_name, email, phone), course:courses(title)").in("course_id", courseIds).eq("status", "pending")
      : { data: [] };

    const liveCourseIds = (courses ?? []).filter((c) => c.course_format !== "self_paced").map((c) => c.id);
    const { data: upcomingSessions } = liveCourseIds.length
      ? await supabase.from("sessions").select("*, course:courses(title)").in("course_id", liveCourseIds).gte("session_date", new Date(Date.now() - 3600000).toISOString()).order("session_date").limit(5)
      : { data: [] };

    return <TeacherDashboard courses={courses ?? []} pendingEnrollments={pendingEnrollments ?? []} upcomingSessions={upcomingSessions ?? []} />;
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(*, teacher:profiles(full_name))")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const approvedLiveCourseIds = (enrollments ?? [])
    .filter((e) => e.status === "approved" && e.course?.course_format !== "self_paced")
    .map((e) => e.course_id);
  const approvedSelfPacedCourseIds = (enrollments ?? [])
    .filter((e) => e.status === "approved" && e.course?.course_format === "self_paced")
    .map((e) => e.course_id);

  const { data: upcomingSessions } = approvedLiveCourseIds.length
    ? await supabase.from("sessions").select("*, course:courses(title)").in("course_id", approvedLiveCourseIds).gte("session_date", new Date(Date.now() - 3600000).toISOString()).order("session_date").limit(10)
    : { data: [] };

  const { data: purchasedLessons } = approvedSelfPacedCourseIds.length
    ? await supabase.from("sessions").select("*, course:courses(title)").in("course_id", approvedSelfPacedCourseIds).order("session_number")
    : { data: [] };

  return <StudentDashboard enrollments={enrollments ?? []} upcomingSessions={upcomingSessions ?? []} purchasedLessons={purchasedLessons ?? []} />;
}
