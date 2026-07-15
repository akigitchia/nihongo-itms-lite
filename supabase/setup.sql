-- ============================================================================
-- NIHONGO ITMS ACADEMY (LITE) — SETUP SQL
-- Copy toàn bộ file này, dán vào Supabase SQL Editor, bấm Run — chỉ cần 1 lần.
-- Tạo bảng + bật Row Level Security + policies. Chỉ có 2 role: teacher / student.
-- ============================================================================

create extension if not exists "uuid-ossp";

create type user_role as enum ('teacher', 'student');
create type enrollment_status as enum ('pending', 'approved', 'rejected');
create type session_status as enum ('scheduled', 'live', 'completed', 'cancelled');

-- ---------------------------------------------------------------------------
-- PROFILES — tạo tự động khi có người đăng ký tài khoản (trigger bên dưới)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role user_role not null default 'student',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COURSES — mỗi khóa học gắn 1 trình độ + 1 lịch học cố định
-- ---------------------------------------------------------------------------
create table courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  level text not null,               -- vd: "Beginner 1 (N5)"
  description text,
  schedule_text text not null,       -- vd: "Thứ 3 & Thứ 5, 19:00–20:00"
  teacher_id uuid not null references profiles(id),
  max_students int not null default 15,
  status text not null default 'open', -- open | closed
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ENROLLMENTS — học viên đăng ký, giáo viên duyệt
-- ---------------------------------------------------------------------------
create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status enrollment_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);

-- ---------------------------------------------------------------------------
-- SESSIONS — từng buổi học cụ thể của 1 khóa
-- ---------------------------------------------------------------------------
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  session_number int not null,
  session_date timestamptz not null,
  duration_minutes int not null default 60,
  meeting_link text,                 -- để trống sẽ tự dùng phòng Jitsi theo session id
  materials_link text,               -- link tài liệu giáo viên tự share (Google Drive...)
  status session_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  unique (course_id, session_number)
);

-- ---------------------------------------------------------------------------
-- ATTENDANCE — điểm danh tự động khi vào lớp
-- ---------------------------------------------------------------------------
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz,
  left_at timestamptz,
  unique (session_id, student_id)
);

-- ---------------------------------------------------------------------------
-- MESSAGES — chat giữa học viên và giáo viên, theo từng khóa học
-- ---------------------------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_enrollments_course on enrollments(course_id);
create index idx_enrollments_student on enrollments(student_id);
create index idx_sessions_course on sessions(course_id);
create index idx_attendance_session on attendance(session_id);
create index idx_messages_course on messages(course_id, created_at);

-- Bật Realtime cho bảng messages để chat cập nhật tức thời trong Live Classroom
alter publication supabase_realtime add table messages;

-- ---------------------------------------------------------------------------
-- Tự tạo profile khi có tài khoản đăng ký mới (role chọn lúc signup)
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table sessions enable row level security;
alter table attendance enable row level security;
alter table messages enable row level security;

create or replace function is_teacher_of_course(target_course_id uuid)
returns boolean as $$
  select exists (select 1 from courses where id = target_course_id and teacher_id = auth.uid());
$$ language sql stable security definer set search_path = public;

create or replace function is_approved_in_course(target_course_id uuid)
returns boolean as $$
  select exists (
    select 1 from enrollments
    where course_id = target_course_id and student_id = auth.uid() and status = 'approved'
  );
$$ language sql stable security definer set search_path = public;

-- PROFILES
create policy "profiles: read own" on profiles for select using (id = auth.uid());
create policy "profiles: update own" on profiles for update using (id = auth.uid());
create policy "profiles: teacher reads own students" on profiles for select
  using (exists (
    select 1 from enrollments e join courses c on c.id = e.course_id
    where e.student_id = profiles.id and c.teacher_id = auth.uid()
  ));
create policy "profiles: student reads own teacher" on profiles for select
  using (exists (
    select 1 from courses c join enrollments e on e.course_id = c.id
    where c.teacher_id = profiles.id and e.student_id = auth.uid()
  ));

-- COURSES — public read (danh sách khóa học hiển thị cho mọi người, kể cả chưa đăng nhập)
create policy "courses: public read" on courses for select using (true);
create policy "courses: teacher creates own" on courses for insert
  with check (teacher_id = auth.uid());
create policy "courses: teacher updates own" on courses for update
  using (teacher_id = auth.uid());

-- ENROLLMENTS
create policy "enrollments: student reads own" on enrollments for select using (student_id = auth.uid());
create policy "enrollments: student creates own" on enrollments for insert with check (student_id = auth.uid());
create policy "enrollments: teacher reads own course" on enrollments for select using (is_teacher_of_course(course_id));
create policy "enrollments: teacher updates own course" on enrollments for update using (is_teacher_of_course(course_id));

-- SESSIONS
create policy "sessions: teacher full access own course" on sessions for all
  using (is_teacher_of_course(course_id)) with check (is_teacher_of_course(course_id));
create policy "sessions: student reads if approved" on sessions for select
  using (is_approved_in_course(course_id));

-- ATTENDANCE
create policy "attendance: teacher reads own course" on attendance for select
  using (exists (select 1 from sessions s where s.id = session_id and is_teacher_of_course(s.course_id)));
create policy "attendance: student manages own" on attendance for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- MESSAGES
create policy "messages: teacher full access own course" on messages for all
  using (is_teacher_of_course(course_id)) with check (is_teacher_of_course(course_id));
create policy "messages: student reads/writes if approved" on messages for select
  using (is_approved_in_course(course_id));
create policy "messages: student writes if approved" on messages for insert
  with check (is_approved_in_course(course_id) and sender_id = auth.uid());
