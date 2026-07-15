"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { LEVELS } from "@/lib/types";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState(LEVELS[0]);
  const [description, setDescription] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [maxStudents, setMaxStudents] = useState(15);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, level, description, schedule_text: scheduleText, max_students: maxStudents }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Tạo khóa học thất bại.");
      const body = await res.json();
      router.push(`/teacher/courses/${body.course.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Tạo khóa học mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tên khóa học</Label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Japanese Incident Communication" />
            </div>
            <div>
              <Label>Trình độ</Label>
              <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Lịch học</Label>
              <Input required value={scheduleText} onChange={(e) => setScheduleText(e.target.value)} placeholder="VD: Thứ 3 & Thứ 5, 19:00–20:00" />
            </div>
            <div>
              <Label>Số học viên tối đa</Label>
              <Input type="number" min={1} value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} />
            </div>
            {error && <Alert tone="error">{error}</Alert>}
            <Button type="submit" className="w-full" isLoading={saving}>
              Tạo khóa học
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
