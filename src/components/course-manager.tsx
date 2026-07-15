"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, FileText, Users, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateVi, formatTimeVi } from "@/lib/utils";

export function CourseManager({ course, sessions, roster, attendance }: { course: any; sessions: any[]; roster: any[]; attendance: any[] }) {
  const [items, setItems] = useState(sessions);
  const [showForm, setShowForm] = useState(false);

  const attendanceBySession = attendance.reduce<Record<string, number>>((acc, a) => {
    if (a.joined_at) acc[a.session_id] = (acc[a.session_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <Badge tone="navy">{course.level}</Badge>
        <h1 className="mt-2 text-2xl font-bold text-sumi-900">{course.title}</h1>
        <p className="text-sm text-sumi-400">{course.schedule_text}</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Buổi học</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
            <CalendarPlus className="h-4 w-4" /> Tạo buổi học
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {showForm && (
            <SessionForm
              courseId={course.id}
              nextNumber={(items.at(-1)?.session_number ?? 0) + 1}
              onCreated={(s) => {
                setItems((prev) => [...prev, s]);
                setShowForm(false);
              }}
            />
          )}

          {items.length === 0 && !showForm && <EmptyState icon={Video} title="Chưa có buổi học nào" />}

          {items.map((s) => (
            <SessionRow key={s.id} session={s} attendeeCount={attendanceBySession[s.id] ?? 0} totalRoster={roster.length} />
          ))}
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

function SessionForm({ courseId, nextNumber, onCreated }: { courseId: string; nextNumber: number; onCreated: (s: any) => void }) {
  const [sessionNumber, setSessionNumber] = useState(nextNumber);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");
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
          session_date: new Date(date).toISOString(),
          duration_minutes: duration,
          meeting_link: meetingLink || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Tạo buổi học thất bại.");
      const body = await res.json();
      onCreated(body.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
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
        <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.jit.si/... hoặc Zoom/Teams/Meet link" />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <Button onClick={handleCreate} isLoading={saving}>
        Tạo buổi học
      </Button>
    </div>
  );
}
