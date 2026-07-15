"use client";

import Link from "next/link";
import { CalendarDays, Video, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateVi, formatTimeVi, getSessionJoinWindow } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Bị từ chối" };
const STATUS_TONE: Record<string, "amber" | "green" | "red"> = { pending: "amber", approved: "green", rejected: "red" };

export function StudentDashboard({ enrollments, upcomingSessions }: { enrollments: any[]; upcomingSessions: any[] }) {
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
                <p className="text-xs text-sumi-400">{e.course?.schedule_text} · GV {e.course?.teacher?.full_name}</p>
              </div>
              <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
