import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/quiz-results — student submits quiz answers; auto-graded server-side
// against quiz_questions.correct_option so answers/scoring can't be tampered with client-side.
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { session_id, answers } = await request.json(); // answers: { [questionId]: optionId }

  const { data: questions } = await supabase.from("quiz_questions").select("*").eq("session_id", session_id);
  if (!questions || questions.length === 0) return NextResponse.json({ error: "Không tìm thấy quiz." }, { status: 404 });

  const score = questions.reduce((sum, q) => sum + (answers?.[q.id] === q.correct_option ? 1 : 0), 0);

  const { data, error } = await supabase
    .from("quiz_results")
    .upsert(
      { session_id, student_id: user.id, score, total_questions: questions.length, submitted_at: new Date().toISOString() },
      { onConflict: "session_id,student_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Nộp bài thất bại." }, { status: 500 });
  return NextResponse.json({ result: data });
}
