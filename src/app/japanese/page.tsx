import { createClient } from "@/lib/supabase/server";
import { CourseCatalog } from "@/components/course-listing-sections";

export default async function JapaneseCoursesPage({ searchParams }: { searchParams: { level?: string } }) {
  const supabase = createClient();
  let query = supabase
    .from("courses")
    .select("*, teacher:profiles(full_name)")
    .eq("status", "open")
    .eq("category", "japanese")
    .order("created_at", { ascending: false });
  if (searchParams.level) query = query.eq("level", searchParams.level);
  const { data: courses } = await query;

  return (
    <div>
      <section className="bg-navy-900 py-14 text-center text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">Tiếng Nhật chuyên ngành ITMS</h1>
        <p className="mx-auto mt-3 max-w-xl text-sumi-100/80">
          Học tiếng Nhật giao tiếp và chuyên ngành qua các tình huống thực tế trong vận hành dịch vụ IT.
        </p>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CourseCatalog courses={courses ?? []} basePath="/japanese" activeLevel={searchParams.level} />
      </div>
    </div>
  );
}
