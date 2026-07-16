import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/courses/[id] — teacher edits their own course.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase.from("courses").update(body.updates).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: "Cập nhật thất bại (kiểm tra quyền)." }, { status: 403 });
  return NextResponse.json({ course: data });
}

// DELETE /api/courses/[id] — teacher deletes their own course.
// Xóa khóa học sẽ tự động xóa theo (cascade) toàn bộ buổi học, đăng ký, điểm danh,
// quiz và tin nhắn liên quan — hành động này không thể hoàn tác.
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { error } = await supabase.from("courses").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Xóa thất bại (kiểm tra quyền)." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
