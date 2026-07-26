import { createClient } from "@/lib/supabase/server";
import { CourseCatalog } from "@/components/course-listing-sections";

export default async function PmCoursesPage({ searchParams }: { searchParams: { level?: string } }) {
  const supabase = createClient();
  let query = supabase
    .from("courses")
    .select("*, teacher:profiles(full_name)")
    .eq("status", "open")
    .eq("category", "pm")
    .order("created_at", { ascending: false });
  if (searchParams.level) query = query.eq("level", searchParams.level);
  const { data: courses } = await query;

  return (
    <div>
      <section className="bg-navy-900 py-14 text-center text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">Đào tạo chuyên môn Quản lý dự án ITMS</h1>
        <p className="mx-auto mt-3 max-w-xl text-sumi-100/80">
          Kiến thức, quy trình và kỹ năng quản lý dự án trong vận hành dịch vụ IT — dành cho Project Manager / Service Delivery Manager.
        </p>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CourseCatalog courses={courses ?? []} basePath="/pm" activeLevel={searchParams.level} />
      </div>
    </div>
  );
}
