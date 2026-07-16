import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: body.title,
      level: body.level,
      description: body.description ?? null,
      schedule_text: body.schedule_text,
      max_students: body.max_students ?? 15,
      teacher_id: user.id,
      status: "open",
      course_format: body.course_format ?? "live",
      price: body.price ?? null,
      payment_note: body.payment_note ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Tạo khóa học thất bại." }, { status: 400 });
  return NextResponse.json({ course: data }, { status: 201 });
}
