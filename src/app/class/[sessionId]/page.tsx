import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClassRoom } from "@/components/class-room";

export default async function ClassPage({ params }: { params: { sessionId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/class/${params.sessionId}`);

  const { data: session } = await supabase.from("sessions").select("*, course:courses(*)").eq("id", params.sessionId).single();
  if (!session) notFound();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;

  // access check: teacher owns the course, or student has an approved enrollment
  const isTeacher = profile.role === "teacher" && session.course?.teacher_id === user.id;
  let isApprovedStudent = false;
  if (profile.role === "student") {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("status")
      .eq("course_id", session.course_id)
      .eq("student_id", user.id)
      .maybeSingle();
    isApprovedStudent = enrollment?.status === "approved";
  }
  if (!isTeacher && !isApprovedStudent) redirect("/dashboard");

  return <ClassRoom session={session} profile={profile} isTeacher={isTeacher} />;
}
