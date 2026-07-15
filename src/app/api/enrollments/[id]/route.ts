import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { status } = await request.json(); // 'approved' | 'rejected'
  const { data, error } = await supabase.from("enrollments").update({ status }).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: "Không thể cập nhật (kiểm tra quyền)." }, { status: 403 });
  return NextResponse.json({ enrollment: data });
}
