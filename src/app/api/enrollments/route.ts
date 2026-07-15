import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/enrollments — học viên đăng ký khóa học (trạng thái pending, chờ giáo viên duyệt)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Bạn cần đăng nhập để đăng ký." }, { status: 401 });

  const { course_id, phone } = await request.json();
  if (!course_id) return NextResponse.json({ error: "Thiếu course_id." }, { status: 400 });

  if (phone) {
    await supabase.from("profiles").update({ phone }).eq("id", user.id);
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert({ student_id: user.id, course_id, status: "pending" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Bạn đã đăng ký khóa học này rồi." }, { status: 409 });
    return NextResponse.json({ error: "Đăng ký thất bại." }, { status: 500 });
  }

  return NextResponse.json({ enrollment: data }, { status: 201 });
}
