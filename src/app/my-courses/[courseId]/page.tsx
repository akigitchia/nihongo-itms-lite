import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PlayCircle, ClipboardList, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ChatPanel } from "@/components/chat-panel";

// Khu vực học của học viên cho 1 khóa tự học: danh sách video, quiz theo từng bài,
// và khung chat để hỏi giáo viên trực tiếp.
export default async function MyCourseLearnPage({ params }: { params: { courseId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/my-courses/${params.courseId}`);

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("course_id", params.courseId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!enrollment || enrollment.status !== "approved") redirect("/dashboard");
  if (!enrollment.course) notFound();

  const { data: sessions } = await supabase.from("sessions").select("*").eq("course_id", params.courseId).order("session_number");
  const sessionIds = (sessions ?? []).map((s) => s.id);

  const { data: quizQuestions } = sessionIds.length
    ? await supabase.from("quiz_questions").select("session_id").in("session_id", sessionIds)
    : { data: [] };
  const quizCountBySession = (quizQuestions ?? []).reduce<Record<string, number>>((acc, q) => {
    acc[q.session_id] = (acc[q.session_id] ?? 0) + 1;
    return acc;
  }, {});

  const { data: results } = sessionIds.length
    ? await supabase.from("quiz_results").select("*").eq("student_id", user.id).in("session_id", sessionIds)
    : { data: [] };
  const resultBySession = Object.fromEntries((results ?? []).map((r) => [r.session_id, r]));

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <Badge tone="shu">Khóa tự học</Badge>
        <h1 className="mt-2 text-2xl font-bold text-sumi-900">{enrollment.course.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bài giảng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(!sessions || sessions.length === 0) && <EmptyState icon={PlayCircle} title="Giáo viên chưa đăng bài giảng nào" />}
          {(sessions ?? []).map((s) => {
            const quizCount = quizCountBySession[s.id] ?? 0;
            const result = resultBySession[s.id];
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sumi-100 p-4">
                <div>
                  <p className="text-xs text-sumi-400">Bài {s.session_number}</p>
                  <p className="font-medium text-sumi-900">{s.title ?? `Bài giảng ${s.session_number}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.materials_link ? (
                    <a href={s.materials_link} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <PlayCircle className="h-4 w-4" /> Xem video
                      </Button>
                    </a>
                  ) : (
                    <Badge tone="amber">Sắp có</Badge>
                  )}
                  {quizCount > 0 && (
                    <Link href={`/quiz/${s.id}`}>
                      <Button size="sm">
                        <ClipboardList className="h-4 w-4" /> {result ? `Kết quả: ${result.score}/${result.total_questions}` : "Làm quiz"}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Hỏi giáo viên
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96 p-0">
          <ChatPanel courseId={params.courseId} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
