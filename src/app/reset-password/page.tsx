"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("done");
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Đặt lại mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "done" ? (
            <Alert tone="success">Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...</Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Mật khẩu mới</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {status === "error" && <Alert tone="error">Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn, hãy yêu cầu gửi lại ở trang Quên mật khẩu.</Alert>}
              <Button type="submit" className="w-full" isLoading={status === "saving"}>
                Xác nhận
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
