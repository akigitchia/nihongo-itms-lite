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
  const [courseFormat, setCourseFormat] = useState<"live" | "self_paced">("live");
  const [scheduleText, setScheduleText] = useState("");
  const [maxStudents, setMaxStudents] = useState(15);
  const [price, setPrice] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
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
        body: JSON.stringify({
          title,
          level,
          description,
          course_format: courseFormat,
          schedule_text: courseFormat === "live" ? scheduleText : "Tự học — xem video bất kỳ lúc nào",
          max_students: courseFormat === "live" ? maxStudents : 999,
          price: courseFormat === "self_paced" ? price : null,
          payment_note: courseFormat === "self_paced" ? paymentNote : null,
        }),
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
              <Label>Loại khóa học</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCourseFormat("live")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${courseFormat === "live" ? "border-navy-700 bg-navy-50 text-navy-700" : "border-sumi-100 text-sumi-600"}`}
                >
                  Lớp trực tuyến (có lịch)
                </button>
                <button
                  type="button"
                  onClick={() => setCourseFormat("self_paced")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${courseFormat === "self_paced" ? "border-navy-700 bg-navy-50 text-navy-700" : "border-sumi-100 text-sumi-600"}`}
                >
                  Khóa tự học (video ghi sẵn)
                </button>
              </div>
            </div>

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

            {courseFormat === "live" ? (
              <>
                <div>
                  <Label>Lịch học</Label>
                  <Input required value={scheduleText} onChange={(e) => setScheduleText(e.target.value)} placeholder="VD: Thứ 3 & Thứ 5, 19:00–20:00" />
                </div>
                <div>
                  <Label>Số học viên tối đa</Label>
                  <Input type="number" min={1} value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Học phí (VND, trả 1 lần)</Label>
                  <Input type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="VD: 990000" />
                </div>
                <div>
                  <Label>Hướng dẫn thanh toán (hiện cho học viên khi đăng ký)</Label>
                  <Textarea
                    rows={3}
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="VD: Chuyển khoản đến STK 0123456789 - Ngân hàng ABC, nội dung: [Họ tên] - [Tên khóa học]. Sau khi chuyển khoản, giáo viên sẽ duyệt trong 24h."
                  />
                </div>
              </>
            )}

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
