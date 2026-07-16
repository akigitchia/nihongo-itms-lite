"use client";

import Link from "next/link";
import { CalendarDays, PlayCircle, Video, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateVi, formatTimeVi, getSessionJoinWindow } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Bị từ chối" };
const STATUS_TONE: Record<string, "amber" | "green" | "red"> = { pending: "amber", approved: "green", rejected: "red" };

export function StudentDashboard({
  enrollments,
  upcomingSessions,
  purchasedLessons = [],
}: {
  enrollments: any[];
  upcomingSessions: any[];
  purchasedLessons?: any[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-sumi-900">Tổng quan học tập</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buổi học sắp tới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingSessions.length === 0 && <EmptyState icon={CalendarDays} title="Chưa có buổi học nào sắp tới" />}
          {upcomingSessions.map((s) => {
            const { canJoin } = getSessionJoinWindow(s.session_date, s.duration_minutes);
            return (
              <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-sumi-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-sumi-400">{s.course?.title} · Buổi {s.session_number}</p>
                  <p className="font-medium text-sumi-900">
                    {formatDateVi(s.session_date)} · {formatTimeVi(s.session_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {s.materials_link && (
                    <a href={s.materials_link} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" /> Tài liệu
                      </Button>
                    </a>
                  )}
                  <Link href={`/class/${s.id}`}>
                    <Button size="sm" disabled={!canJoin}>
                      <Video className="h-4 w-4" /> {canJoin ? "Vào lớp" : "Chưa đến giờ"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {purchasedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Video bài giảng đã mua</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(
              purchasedLessons.reduce<Record<string, any[]>>((acc, s) => {
                const key = s.course?.title ?? "Khóa học";
                acc[key] = acc[key] ?? [];
                acc[key].push(s);
                return acc;
              }, {})
            ).map(([courseTitle, lessons]) => (
              <div key={courseTitle} className="rounded-lg border border-sumi-100 p-4">
                <p className="mb-2 text-sm font-semibold text-sumi-900">{courseTitle}</p>
                <div className="space-y-2">
                  {lessons.map((l) => (
                    <div key={l.id} className="flex items-center justify-between rounded-lg bg-sumi-50 px-3 py-2">
                      <p className="text-sm text-sumi-900">
                        Bài {l.session_number}{l.title ? ` — ${l.title}` : ""}
                      </p>
                      {l.materials_link ? (
                        <a href={l.materials_link} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline">
                            <PlayCircle className="h-4 w-4" /> Xem video
                          </Button>
                        </a>
                      ) : (
                        <Badge tone="amber">Sắp có</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Khóa học của tôi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {enrollments.length === 0 && (
            <EmptyState icon={CalendarDays} title="Chưa đăng ký khóa học nào" action={<Link href="/"><Button size="sm">Xem khóa học</Button></Link>} />
          )}
          {enrollments.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-sumi-100 p-4">
              <div>
                <p className="font-medium text-sumi-900">{e.course?.title}</p>
                <p className="text-xs text-sumi-400">
                  {e.course?.course_format === "self_paced" ? "Khóa tự học" : e.course?.schedule_text} · GV {e.course?.teacher?.full_name}
                </p>
              </div>
              <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
