import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string; role: string } | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sumi-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700 text-sm font-bold text-white">日</span>
          <span className="text-sm font-semibold text-sumi-900 sm:text-base">
            Nihongo <span className="text-shu-500">ITMS</span> Academy
          </span>
        </Link>

        {profile ? (
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-sumi-600 hover:text-navy-700">
              Tổng quan
            </Link>
            {profile.role === "teacher" && (
              <Link href="/teacher/courses/new" className="text-sm font-medium text-sumi-600 hover:text-navy-700">
                Tạo khóa học
              </Link>
            )}
            <span className="hidden text-sm text-sumi-400 sm:inline">Xin chào, {profile.full_name}</span>
            <form action="/api/auth/signout" method="post">
              <Button variant="outline" size="sm">
                Đăng xuất
              </Button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="sm">
                Tạo tài khoản
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
