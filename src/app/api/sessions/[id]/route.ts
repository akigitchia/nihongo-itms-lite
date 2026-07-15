import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await request.json(); // { updates: {...} }
  const { data, error } = await supabase.from("sessions").update(body.updates).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: "Cập nhật thất bại." }, { status: 403 });
  return NextResponse.json({ session: data });
}
