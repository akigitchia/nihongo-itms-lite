import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/quiz-questions — teacher adds a multiple-choice question to a lesson (session).
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      session_id: body.session_id,
      question_text: body.question_text,
      options: body.options,
      correct_option: body.correct_option,
      sequence: body.sequence ?? 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Tạo câu hỏi thất bại (kiểm tra quyền)." }, { status: 400 });
  return NextResponse.json({ question: data }, { status: 201 });
}
