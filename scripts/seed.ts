/**
 * Seed script — tạo dữ liệu demo tối thiểu để test nhanh.
 * Chạy: npm run seed  (cần NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local)
 *
 * Dùng auth.signUp bình thường (không cần SUPABASE_SERVICE_ROLE_KEY) — nếu project của bạn
 * đang bật "Confirm email", hãy tắt tạm ở Authentication > Settings để seed chạy trót lọt,
 * hoặc set SUPABASE_SERVICE_ROLE_KEY để script tự xác nhận email qua Admin API.
 */
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local");

const admin = serviceKey ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
const DEMO_PASSWORD = "Demo123!";

async function createUser(email: string, full_name: string, role: "teacher" | "student") {
  if (admin) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name, role },
    });
    if (error && !error.message.includes("already been registered")) throw error;
    if (data?.user) return data.user.id;
    const { data: list } = await admin.auth.admin.listUsers();
    return list.users.find((u) => u.email === email)!.id;
  }

  const client = createClient(url, anonKey);
  const { data, error } = await client.auth.signUp({
    email,
    password: DEMO_PASSWORD,
    options: { data: { full_name, role } },
  });
  if (error && !error.message.includes("already registered")) throw error;
  return data.user!.id;
}

async function main() {
  console.log("🌱 Seeding Nihongo ITMS Academy (lite)...");
  const db = admin ?? createClient(url, anonKey);

  const teacherId = await createUser("teacher@nihongo-itms.demo", "Yamada Sensei", "teacher");
  const student1 = await createUser("student@nihongo-itms.demo", "Nguyen Van An", "student");
  const student2 = await createUser("student2@nihongo-itms.demo", "Le Thi Bich", "student");
  const student3 = await createUser("student3@nihongo-itms.demo", "Pham Minh Chau", "student");

  if (!admin) {
    console.log("⚠️  Không có SUPABASE_SERVICE_ROLE_KEY — nếu project bật Confirm Email, hãy xác nhận email thủ công trước khi đăng nhập.");
  }

  const { data: course1 } = await db
    .from("courses")
    .insert({
      title: "Beginner Japanese for IT Engineers",
      level: "Beginner 1 (N5)",
      description: "Giao tiếp cơ bản cho kỹ sư IT, học 2 buổi/tuần.",
      schedule_text: "Thứ 3 & Thứ 5, 19:00–20:00",
      teacher_id: teacherId,
      max_students: 15,
      status: "open",
    })
    .select()
    .single();

  const { data: course2 } = await db
    .from("courses")
    .insert({
      title: "Japanese Incident Communication",
      level: "Japanese for ITMS Professionals",
      description: "Tiếp nhận incident, cập nhật tiến độ, báo cáo khôi phục dịch vụ cho khách Nhật.",
      schedule_text: "Thứ 2 & Thứ 4, 20:00–21:00",
      teacher_id: teacherId,
      max_students: 12,
      status: "open",
    })
    .select()
    .single();

  if (!course1 || !course2) throw new Error("Tạo khóa học thất bại — kiểm tra RLS đã chạy setup.sql chưa.");

  // enroll students: student1 & student2 approved vào course1, student3 pending vào course2
  await db.from("enrollments").insert([
    { student_id: student1, course_id: course1.id, status: "approved" },
    { student_id: student2, course_id: course1.id, status: "approved" },
    { student_id: student3, course_id: course2.id, status: "pending" },
  ]);

  // sessions: 1 buổi đã qua (để test lịch sử) + 1 buổi sắp tới (trong vòng vài phút, để test nút "Vào lớp")
  const now = Date.now();
  await db.from("sessions").insert([
    {
      course_id: course1.id,
      session_number: 1,
      session_date: new Date(now - 3 * 24 * 3600000).toISOString(),
      duration_minutes: 60,
      status: "completed",
    },
    {
      course_id: course1.id,
      session_number: 2,
      session_date: new Date(now + 5 * 60000).toISOString(), // 5 phút nữa — bấm được "Vào lớp" ngay
      duration_minutes: 60,
      materials_link: "https://drive.google.com/drive/folders/example",
      status: "scheduled",
    },
    {
      course_id: course2.id,
      session_number: 1,
      session_date: new Date(now + 2 * 24 * 3600000).toISOString(),
      duration_minutes: 60,
      status: "scheduled",
    },
  ]);

  console.log("✅ Seed hoàn tất. Tài khoản demo (mật khẩu: Demo123!):");
  console.log("  teacher@nihongo-itms.demo · student@nihongo-itms.demo · student2@nihongo-itms.demo · student3@nihongo-itms.demo");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
