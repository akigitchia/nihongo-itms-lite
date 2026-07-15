"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
        <Card className="w-full">
          <CardContent className="pt-6">
            <Alert tone="success">Tạo tài khoản thành công! Kiểm tra email để xác nhận, sau đó đăng nhập.</Alert>
            <Link href="/login">
              <Button className="mt-4 w-full">Đến trang đăng nhập</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Tạo tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Bạn là</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${role === "student" ? "border-navy-700 bg-navy-50 text-navy-700" : "border-sumi-100 text-sumi-600"}`}
                >
                  Học viên
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${role === "teacher" ? "border-navy-700 bg-navy-50 text-navy-700" : "border-sumi-100 text-sumi-600"}`}
                >
                  Giáo viên
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="full_name">Họ và tên</Label>
              <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <Alert tone="error">{error}</Alert>}
            <Button type="submit" className="w-full" isLoading={loading}>
              Tạo tài khoản
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-sumi-400">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-navy-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
