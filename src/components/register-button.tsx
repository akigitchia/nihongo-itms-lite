"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function RegisterButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId, phone }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Đăng ký thất bại.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-sumi-100 p-5">
      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Để giáo viên liên hệ khi cần" />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <Button className="w-full" onClick={handleRegister} isLoading={loading}>
        Đăng ký khóa học
      </Button>
    </div>
  );
}
