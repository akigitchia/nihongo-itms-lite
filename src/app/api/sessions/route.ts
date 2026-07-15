import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/sessions — teacher schedules a new class session for their course.
// meeting_link left blank auto-falls-back to a Jitsi room derived from the session id (see ClassRoom).
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      course_id: body.course_id,
      session_number: body.session_number,
      session_date: body.session_date,
      duration_minutes: body.duration_minutes ?? 60,
      meeting_link: body.meeting_link || null,
      materials_link: body.materials_link || null,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Tạo buổi học thất bại (kiểm tra quyền hoặc số buổi trùng)." }, { status: 400 });
  return NextResponse.json({ session: data }, { status: 201 });
}
