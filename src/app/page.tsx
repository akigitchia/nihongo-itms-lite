import Link from "next/link";
import { CalendarDays, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";
import { LEVELS } from "@/lib/types";

function formatVnd(amount: number | null) {
  if (!amount) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

export default async function HomePage({ searchParams }: { searchParams: { level?: string } }) {
  const supabase = createClient();
  let query = supabase.from("courses").select("*, teacher:profiles(full_name)").eq("status", "open").order("created_at", { ascending: false });
  if (searchParams.level) query = query.eq("level", searchParams.level);
  const { data: courses } = await query;

  return (
    <div>
      <section className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Japanese for <span className="text-shu-500">ITMS</span> Professionals
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sumi-100/80">
          Học tiếng Nhật giao tiếp và chuyên ngành IT Managed Services — lớp trực tuyến có lịch, hoặc khóa tự học video.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/">
            <Badge tone={!searchParams.level ? "navy" : "gray"}>Tất cả trình độ</Badge>
          </Link>
          {LEVELS.map((l) => (
            <Link key={l} href={`/?level=${encodeURIComponent(l)}`}>
              <Badge tone={searchParams.level === l ? "navy" : "gray"}>{l}</Badge>
            </Link>
          ))}
        </div>

        {(!courses || courses.length === 0) && (
          <EmptyState icon={SearchX} title="Chưa có khóa học nào đang mở đăng ký" />
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(courses ?? []).map((c: any) => {
            const isSelfPaced = c.course_format === "self_paced";
            return (
              <Card key={c.id}>
                <CardContent className="pt-6">
                  <div className="mb-1 flex flex-wrap gap-1.5">
                    <Badge tone="navy">{c.level}</Badge>
                    <Badge tone={isSelfPaced ? "shu" : "green"}>{isSelfPaced ? "Khóa tự học" : "Lớp trực tuyến"}</Badge>
                  </div>
                  <h3 className="mt-2 font-semibold text-sumi-900">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-sumi-400">{c.description}</p>
                  {isSelfPaced ? (
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-sumi-400">
                      <Wallet className="h-4 w-4" /> {formatVnd(c.price)} · trả 1 lần, xem mãi mãi
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 flex items-center gap-1.5 text-sm text-sumi-400">
                        <CalendarDays className="h-4 w-4" /> {c.schedule_text}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-sumi-400">
                        <Users className="h-4 w-4" /> Tối đa {c.max_students} học viên
                      </div>
                    </>
                  )}
                  <p className="mt-1 text-xs text-sumi-400">GV {c.teacher?.full_name}</p>
                  <Link href={`/courses/${c.id}`}>
                    <Button size="sm" className="mt-4 w-full">
                      Xem chi tiết & đăng ký
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
