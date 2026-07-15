import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";
import { LEVELS } from "@/lib/types";

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
          Học tiếng Nhật giao tiếp và chuyên ngành IT Managed Services, học online 1:1 lịch cố định.
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
          {(courses ?? []).map((c: any) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <Badge tone="navy">{c.level}</Badge>
                <h3 className="mt-2 font-semibold text-sumi-900">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-sumi-400">{c.description}</p>
                <div className="mt-3 flex items-center gap-1.5 text-sm text-sumi-400">
                  <CalendarDays className="h-4 w-4" /> {c.schedule_text}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-sumi-400">
                  <Users className="h-4 w-4" /> Tối đa {c.max_students} học viên · GV {c.teacher?.full_name}
                </div>
                <Link href={`/courses/${c.id}`}>
                  <Button size="sm" className="mt-4 w-full">
                    Xem chi tiết & đăng ký
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
