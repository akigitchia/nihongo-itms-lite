"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

export function QuizRunner({ session, questions, existingResult }: { session: any; questions: any[]; existingResult: any }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState(existingResult);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/quiz-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, answers }),
      });
      if (!res.ok) throw new Error("Nộp bài thất bại.");
      const body = await res.json();
      setResult(body.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-1 text-sm text-navy-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>
      <div>
        <p className="text-xs text-sumi-400">{session.course?.title}</p>
        <h1 className="text-2xl font-bold text-sumi-900">Quiz — {session.title ?? `Bài ${session.session_number}`}</h1>
      </div>

      {result ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Badge tone="green">Kết quả: {result.score}/{result.total_questions}</Badge>
            <p className="text-sm text-sumi-400">Bạn có thể làm lại để cải thiện điểm — điểm mới sẽ thay thế điểm cũ.</p>
            <Button
              variant="outline"
              onClick={() => {
                setAnswers({});
                setResult(null);
              }}
            >
              Làm lại
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="space-y-2 pt-6">
                <p className="font-medium text-sumi-900">
                  {i + 1}. {q.question_text}
                </p>
                {(q.options ?? []).map((opt: any) => (
                  <label key={opt.id} className="flex items-center gap-2 text-sm text-sumi-600">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt.id}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                    />
                    {opt.text}
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
          {error && <Alert tone="error">{error}</Alert>}
          <Button
            className="w-full"
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={Object.keys(answers).length < questions.length}
          >
            Nộp bài ({Object.keys(answers).length}/{questions.length} câu đã trả lời)
          </Button>
        </>
      )}
    </div>
  );
}
