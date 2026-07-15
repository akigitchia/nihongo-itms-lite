import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { RegisterButton } from "@/components/register-button";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase.from("courses").select("*, teacher:profiles(full_name)").eq("id", params.id).single();
  if (!course) notFound();

  const { count: approvedCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", course.id)
    .eq("status", "approved");

  let myEnrollment = null;
  if (user) {
    const { data } = await supabase.from("enrollments").select("*").eq("course_id", course.id).eq("student_id", user.id).maybeSingle();
    myEnrollment = data;
  }

  const seatsLeft = Math.max(0, course.max_students - (approvedCount ?? 0));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Badge tone="navy">{course.level}</Badge>
      <h1 className="mt-2 text-2xl font-bold text-sumi-900">{course.title}</h1>
      <p className="mt-3 text-sumi-400">{course.description}</p>

      <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-sumi-100 p-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-sumi-400">
            <CalendarDays className="h-3.5 w-3.5" /> Lịch học
          </div>
          <p className="mt-1 text-sm font-semibold text-sumi-900">{course.schedule_text}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-sumi-400">
            <Users className="h-3.5 w-3.5" /> Chỗ còn lại
          </div>
          <p className="mt-1 text-sm font-semibold text-sumi-900">{seatsLeft}/{course.max_students}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-sumi-400">
            <GraduationCap className="h-3.5 w-3.5" /> Giáo viên
          </div>
          <p className="mt-1 text-sm font-semibold text-sumi-900">{course.teacher?.full_name}</p>
        </div>
      </div>

      <div className="mt-8">
        {!user && (
          <div className="rounded-xl border border-sumi-100 p-5 text-center">
            <p className="mb-3 text-sm text-sumi-400">Đăng nhập để đăng ký khóa học này.</p>
            <Link href={`/login?redirect=/courses/${course.id}`}>
              <Button className="w-full">Đăng nhập</Button>
            </Link>
          </div>
        )}
        {user && myEnrollment && (
          <Alert tone={myEnrollment.status === "approved" ? "success" : myEnrollment.status === "rejected" ? "error" : "info"}>
            Trạng thái đăng ký của bạn: <strong>{myEnrollment.status}</strong>
            {myEnrollment.status === "approved" && (
              <>
                {" "}
                — <Link href="/dashboard" className="underline">Xem lịch học của bạn</Link>
              </>
            )}
          </Alert>
        )}
        {user && !myEnrollment && seatsLeft > 0 && <RegisterButton courseId={course.id} />}
        {user && !myEnrollment && seatsLeft <= 0 && <Alert tone="info">Lớp đã đủ số lượng học viên tối đa.</Alert>}
      </div>
    </div>
  );
}
