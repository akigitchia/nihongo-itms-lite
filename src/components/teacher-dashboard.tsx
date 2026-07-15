"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, Plus, Video, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateVi, formatTimeVi, getSessionJoinWindow } from "@/lib/utils";

export function TeacherDashboard({ courses, pendingEnrollments, upcomingSessions }: { courses: any[]; pendingEnrollments: any[]; upcomingSessions: any[] }) {
  const [pending, setPending] = useState(pendingEnrollments);

  async function handleDecision(id: string, status: "approved" | "rejected") {
    setPending((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sumi-900">Tổng quan giảng dạy</h1>
        <Link href="/teacher/courses/new">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tạo khóa học
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đăng ký chờ duyệt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pending.length === 0 && <p className="text-sm text-sumi-400">Không có đăng ký nào chờ duyệt.</p>}
          {pending.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-sumi-100 p-3">
              <div>
                <p className="text-sm font-medium text-sumi-900">{e.student?.full_name}</p>
                <p className="text-xs text-sumi-400">{e.course?.title} · {e.student?.email}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleDecision(e.id, "approved")}>
                  <Check className="h-4 w-4" /> Duyệt
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDecision(e.id, "rejected")}>
                  <X className="h-4 w-4" /> Từ chối
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buổi học sắp tới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingSessions.length === 0 && <EmptyState icon={CalendarDays} title="Chưa có buổi học nào sắp tới" />}
          {upcomingSessions.map((s: any) => {
            const { canJoin } = getSessionJoinWindow(s.session_date, s.duration_minutes);
            return (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-sumi-100 p-3">
                <div>
                  <p className="text-xs text-sumi-400">{s.course?.title} · Buổi {s.session_number}</p>
                  <p className="text-sm font-medium text-sumi-900">
                    {formatDateVi(s.session_date)} · {formatTimeVi(s.session_date)}
                  </p>
                </div>
                <Link href={`/class/${s.id}`}>
                  <Button size="sm" disabled={!canJoin}>
                    <Video className="h-4 w-4" /> {canJoin ? "Bắt đầu lớp" : "Chưa đến giờ"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Khóa học của tôi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {courses.map((c) => (
            <div key={c.id} className="rounded-lg border border-sumi-100 p-4">
              <Badge tone="navy">{c.level}</Badge>
              <p className="mt-2 font-medium text-sumi-900">{c.title}</p>
              <p className="text-xs text-sumi-400">{c.schedule_text}</p>
              <Link href={`/teacher/courses/${c.id}`}>
                <Button size="sm" variant="outline" className="mt-3">
                  Quản lý
                </Button>
              </Link>
            </div>
          ))}
          {courses.length === 0 && <p className="text-sm text-sumi-400">Bạn chưa tạo khóa học nào.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
