import Link from "next/link";
import { CalendarDays, Users, Wallet, Video, PlayCircle, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

function formatVnd(amount: number | null) {
  if (!amount) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

function CourseCard({ c }: { c: any }) {
  const isSelfPaced = c.course_format === "self_paced";
  return (
    <Card>
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
}

// Danh sách khóa học dùng chung cho cả 2 chuyên mục (/pm và /japanese):
// tự tách "Lớp trực tuyến" / "Khóa tự học" thành 2 khu vực riêng,
// và tự tính danh sách trình độ để lọc dựa trên dữ liệu thực tế (không hard-code).
export function CourseCatalog({ courses, basePath, activeLevel }: { courses: any[]; basePath: string; activeLevel?: string }) {
  const levels = Array.from(new Set(courses.map((c: any) => c.level))).sort();
  const liveCourses = courses.filter((c: any) => c.course_format !== "self_paced");
  const selfPacedCourses = courses.filter((c: any) => c.course_format === "self_paced");

  return (
    <div>
      {levels.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <Link href={basePath}>
            <Badge tone={!activeLevel ? "navy" : "gray"}>Tất cả trình độ</Badge>
          </Link>
          {levels.map((l) => (
            <Link key={l} href={`${basePath}?level=${encodeURIComponent(l)}`}>
              <Badge tone={activeLevel === l ? "navy" : "gray"}>{l}</Badge>
            </Link>
          ))}
        </div>
      )}

      {courses.length === 0 && <EmptyState icon={SearchX} title="Chưa có khóa học nào đang mở đăng ký" />}

      {liveCourses.length > 0 && (
        <section id="live-courses" className="scroll-mt-20">
          <div className="mb-5 flex items-center gap-2">
            <Video className="h-5 w-5 text-navy-700" />
            <h2 className="text-xl font-bold text-sumi-900">Lớp trực tuyến</h2>
            <Badge tone="gray">{liveCourses.length} khóa</Badge>
          </div>
          <p className="mb-5 text-sm text-sumi-400">Học theo lịch cố định, tương tác trực tiếp với giáo viên qua video call.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liveCourses.map((c: any) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}

      {selfPacedCourses.length > 0 && (
        <section id="self-paced-courses" className="mt-14 scroll-mt-20 border-t border-sumi-100 pt-10">
          <div className="mb-5 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-shu-500" />
            <h2 className="text-xl font-bold text-sumi-900">Khóa tự học</h2>
            <Badge tone="gray">{selfPacedCourses.length} khóa</Badge>
          </div>
          <p className="mb-5 text-sm text-sumi-400">Video ghi sẵn, học mọi lúc mọi nơi, có quiz kiểm tra và chat hỏi giáo viên.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {selfPacedCourses.map((c: any) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
