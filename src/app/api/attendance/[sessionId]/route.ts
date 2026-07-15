import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { data, error } = await supabase
    .from("attendance")
    .upsert({ session_id: params.sessionId, student_id: user.id, joined_at: new Date().toISOString() }, { onConflict: "session_id,student_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Không thể ghi nhận điểm danh." }, { status: 500 });
  return NextResponse.json({ attendance: data });
}

export async function PATCH(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { data, error } = await supabase
    .from("attendance")
    .update({ left_at: new Date().toISOString() })
    .eq("session_id", params.sessionId)
    .eq("student_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Không thể cập nhật điểm danh." }, { status: 500 });
  return NextResponse.json({ attendance: data });
}
