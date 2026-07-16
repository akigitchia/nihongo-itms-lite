"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, FileText, MessageCircle, PlayCircle, Plus, Trash2, Users, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ChatPanel } from "@/components/chat-panel";
import { formatDateVi, formatTimeVi } from "@/lib/utils";

export function CourseManager({
  course,
  sessions,
  roster,
  attendance,
  quizQuestions,
  currentUserId,
}: {
  course: any;
  sessions: any[];
  roster: any[];
  attendance: any[];
  quizQuestions: any[];
  currentUserId: string;
}) {
  const [items, setItems] = useState(sessions);
  const [showForm, setShowForm] = useState(false);
  const [questions, setQuestions] = useState(quizQuestions);
  const isSelfPaced = course.course_format === "self_paced";

  const attendanceBySession = attendance.reduce<Record<string, number>>((acc, a) => {
    if (a.joined_at) acc[a.session_id] = (acc[a.session_id] ?? 0) + 1;
    return acc;
  }, {});

  const questionsBySession = questions.reduce<Record<string, any[]>>((acc, q) => {
    acc[q.session_id] = acc[q.session_id] ?? [];
    acc[q.session_id].push(q);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <div className="mb-1 flex gap-1.5">
          <Badge tone="navy">{course.level}</Badge>
          <Badge tone={isSelfPaced ? "shu" : "green"}>{isSelfPaced ? "Khóa tự học" : "Lớp trực tuyến"}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-sumi-900">{course.title}</h1>
        <p className="text-sm text-sumi-400">{isSelfPaced ? `Học phí: ${course.price ? course.price.toLocaleString("vi-VN") + "đ" : "Miễn phí"}` : course.schedule_text}</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{isSelfPaced ? "Bài giảng video" : "Buổi học"}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
            <CalendarPlus className="h-4 w-4" /> {isSelfPaced ? "Thêm bài giảng" : "Tạo buổi học"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {showForm && (
            <SessionForm
              courseId={course.id}
              isSelfPaced={isSelfPaced}
              nextNumber={(items.at(-1)?.session_number ?? 0) + 1}
              onCreated={(s) => {
                setItems((prev) => [...prev, s]);
                setShowForm(false);
              }}
            />
          )}

          {items.length === 0 && !showForm && <EmptyState icon={isSelfPaced ? PlayCircle : Video} title={isSelfPaced ? "Chưa có bài giảng nào" : "Chưa có buổi học nào"} />}

          {items.map((s) =>
            isSelfPaced ? (
              <LessonRow
                key={s.id}
                session={s}
                questions={questionsBySession[s.id] ?? []}
                onQuestionAdded={(q) => setQuestions((prev) => [...prev, q])}
              />
            ) : (
              <SessionRow key={s.id} session={s} attendeeCount={attendanceBySession[s.id] ?? 0} totalRoster={roster.length} />
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Học viên đã duyệt ({roster.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {roster.length === 0 && <EmptyState icon={Users} title="Chưa có học viên nào được duyệt" />}
          {roster.map((r: any) => (
            <div key={r.id} className="rounded-lg border border-sumi-100 p-3">
              <p className="text-sm font-medium text-sumi-900">{r.student?.full_name}</p>
              <p className="text-xs text-sumi-400">{r.student?.email} {r.student?.phone ? `· ${r.student.phone}` : ""}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Tin nhắn từ học viên
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96 p-0">
          <ChatPanel courseId={course.id} currentUserId={currentUserId} />
        </CardContent>
      </Card>
    </div>
  );
}

function LessonRow({ session, questions, onQuestionAdded }: { session: any; questions: any[]; onQuestionAdded: (q: any) => void }) {
  const [showQuizForm, setShowQuizForm] = useState(false);

  return (
    <div className="rounded-lg border border-sumi-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-sumi-400">Bài {session.session_number}</p>
          <p className="font-medium text-sumi-900">{session.title ?? `Bài giảng ${session.session_number}`}</p>
        </div>
        <div className="flex items-center gap-2">
          {session.materials_link ? (
            <a href={session.materials_link} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <PlayCircle className="h-4 w-4" /> Xem video
              </Button>
            </a>
          ) : (
            <Badge tone="amber">Chưa có link video</Badge>
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-sumi-100 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-sumi-600">Quiz ({questions.length} câu hỏi)</p>
          <Button size="sm" variant="ghost" onClick={() => setShowQuizForm((s) => !s)}>
            <Plus className="h-4 w-4" /> Thêm câu hỏi
          </Button>
        </div>
        {questions.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-sumi-400">
            {questions.map((q, i) => (
              <li key={q.id}>
                {i + 1}. {q.question_text}
              </li>
            ))}
          </ul>
        )}
        {showQuizForm && (
          <QuizQuestionForm
            sessionId={session.id}
            nextSequence={questions.length + 1}
            onCreated={(q) => {
              onQuestionAdded(q);
              setShowQuizForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function QuizQuestionForm({ sessionId, nextSequence, onCreated }: { sessionId: string; nextSequence: number; onCreated: (q: any) => void }) {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { id: "a", text: "" },
    { id: "b", text: "" },
  ]);
  const [correctOption, setCorrectOption] = useState("a");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/quiz-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question_text: questionText,
          options,
          correct_option: correctOption,
          sequence: nextSequence,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Tạo câu hỏi thất bại.");
      const body = await res.json();
      onCreated(body.question);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-dashed border-sumi-100 bg-sumi-50/50 p-3">
      <Input placeholder="Câu hỏi" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
      {options.map((opt, i) => (
        <div key={opt.id} className="flex items-center gap-2">
          <input type="radio" name="correct" checked={correctOption === opt.id} onChange={() => setCorrectOption(opt.id)} />
          <Input
            placeholder={`Đáp án ${opt.id.toUpperCase()}${opt.id === correctOption ? " (đúng)" : ""}`}
            value={opt.text}
            onChange={(e) => setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, text: e.target.value } : o)))}
          />
          {options.length > 2 && (
            <button type="button" onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4 text-shu-500" />
            </button>
          )}
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOptions((prev) => [...prev, { id: String.fromCharCode(97 + prev.length), text: "" }])}
      >
        + Thêm đáp án
      </Button>
      {error && <Alert tone="error">{error}</Alert>}
      <Button size="sm" onClick={handleSave} isLoading={saving}>
        Lưu câu hỏi
      </Button>
      <p className="text-xs text-sumi-400">Tick chọn đáp án đúng ở ô tròn bên trái trước khi lưu.</p>
    </div>
  );
}

function SessionRow({ session, attendeeCount, totalRoster }: { session: any; attendeeCount: number; totalRoster: number }) {
  const [materialsLink, setMaterialsLink] = useState(session.materials_link ?? "");
  const [saved, setSaved] = useState(false);

  async function saveMaterials() {
    await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: { materials_link: materialsLink } }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="rounded-lg border border-sumi-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-sumi-400">Buổi {session.session_number}</p>
          <p className="font-medium text-sumi-900">
            {formatDateVi(session.session_date)} · {formatTimeVi(session.session_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="gray">
            Điểm danh {attendeeCount}/{totalRoster}
          </Badge>
          <Link href={`/class/${session.id}`}>
            <Button size="sm">
              <Video className="h-4 w-4" /> Vào lớp
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-sumi-400" />
        <Input
          placeholder="Dán link tài liệu (Google Drive, OneDrive...) để share cho học viên"
          value={materialsLink}
          onChange={(e) => setMaterialsLink(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" variant="outline" onClick={saveMaterials}>
          Lưu
        </Button>
      </div>
      {saved && <p className="mt-1 text-xs text-emerald-600">Đã lưu.</p>}
    </div>
  );
}

function SessionForm({ courseId, isSelfPaced, nextNumber, onCreated }: { courseId: string; isSelfPaced: boolean; nextNumber: number; onCreated: (s: any) => void }) {
  const [sessionNumber, setSessionNumber] = useState(nextNumber);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          session_number: sessionNumber,
          title: isSelfPaced ? title : undefined,
          session_date: isSelfPaced ? null : new Date(date).toISOString(),
          duration_minutes: duration,
          meeting_link: isSelfPaced ? null : meetingLink || null,
          materials_link: isSelfPaced ? videoLink || null : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Tạo thất bại.");
      const body = await res.json();
      onCreated(body.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  if (isSelfPaced) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-sumi-100 bg-sumi-50/50 p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label>Bài số</Label>
            <Input type="number" value={sessionNumber} onChange={(e) => setSessionNumber(Number(e.target.value))} />
          </div>
          <div className="sm:col-span-3">
            <Label>Tên bài giảng</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Chào hỏi và giới thiệu bản thân" />
          </div>
        </div>
        <div>
          <Label>Link video (YouTube ẩn/không công khai, Google Drive...)</Label>
          <Input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="https://..." />
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <Button onClick={handleCreate} isLoading={saving}>
          Thêm bài giảng
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-sumi-100 bg-sumi-50/50 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Buổi số</Label>
          <Input type="number" value={sessionNumber} onChange={(e) => setSessionNumber(Number(e.target.value))} />
        </div>
        <div>
          <Label>Ngày & giờ</Label>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Thời lượng (phút)</Label>
          <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>
      </div>
      <div>
        <Label>Link video call (để trống sẽ tự tạo phòng Jitsi)</Label>
        <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.jit.si/... hoặc Zoom/Teams/Meet/Daily link" />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <Button onClick={handleCreate} isLoading={saving}>
        Tạo buổi học
      </Button>
    </div>
  );
}
