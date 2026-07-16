import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizRunner } from "@/components/quiz-runner";

export default async function QuizPage({ params }: { params: { sessionId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/quiz/${params.sessionId}`);

  const { data: session } = await supabase.from("sessions").select("*, course:courses(title)").eq("id", params.sessionId).single();
  if (!session) notFound();

  const { data: questions } = await supabase.from("quiz_questions").select("*").eq("session_id", params.sessionId).order("sequence");
  if (!questions || questions.length === 0) notFound();

  const { data: existingResult } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("session_id", params.sessionId)
    .eq("student_id", user.id)
    .maybeSingle();

  return <QuizRunner session={session} questions={questions} existingResult={existingResult} />;
}
