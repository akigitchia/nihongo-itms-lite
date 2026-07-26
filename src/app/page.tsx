import Link from "next/link";
import { Briefcase, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      <section className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Nihongo ITMS Academy</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sumi-100/80">
          Nền tảng đào tạo dành cho kỹ sư và nhân sự IT Managed Services — kết hợp chuyên môn quản lý dự án và tiếng Nhật chuyên ngành.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="flex h-32 items-center justify-center bg-navy-700">
              <Briefcase className="h-12 w-12 text-white" />
            </div>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-sumi-900">Đào tạo chuyên môn ITMS</h2>
              <p className="mt-2 text-sm text-sumi-400">
                Kiến thức, quy trình và kỹ năng quản lý dự án trong vận hành dịch vụ IT — dành cho Project Manager, Service Delivery Manager.
              </p>
              <Link href="/pm">
                <Button className="mt-5 w-full">Khám phá khóa học PM</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex h-32 items-center justify-center bg-shu-500">
              <Languages className="h-12 w-12 text-white" />
            </div>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-sumi-900">Tiếng Nhật chuyên ngành ITMS</h2>
              <p className="mt-2 text-sm text-sumi-400">
                Học tiếng Nhật giao tiếp và chuyên ngành qua các tình huống thực tế trong vận hành dịch vụ IT — từ N5 đến chuyên sâu ITMS.
              </p>
              <Link href="/japanese">
                <Button variant="secondary" className="mt-5 w-full">Khám phá khóa học tiếng Nhật</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
