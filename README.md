# Nihongo ITMS Academy — Bản Lite

Bản rút gọn: chỉ 2 vai trò (**Giáo viên** / **Học viên**), không cần Admin, không cần upload/lưu
file lên nền tảng. Đủ để deploy trong ~15 phút.

## Tính năng

- Học viên đăng ký khóa học (chọn theo trình độ + lịch học có sẵn), giáo viên duyệt.
- Cả hai đăng nhập chung 1 hệ thống, vào lớp học đúng khung giờ đã lên lịch (nút "Vào lớp" chỉ
  bật trong khoảng 15 phút trước giờ học đến hết giờ + 15 phút).
- Lớp học trực tuyến qua Jitsi Meet nhúng sẵn (miễn phí, không cần tài khoản Zoom/Teams — nhưng
  giáo viên vẫn có thể dán link Zoom/Teams/Google Meet riêng nếu muốn).
- Giáo viên **present tài liệu bằng share-screen ngay trong buổi học** — không cần upload file
  lên nền tảng.
- Mỗi buổi học có 1 ô "link tài liệu" (dán link Google Drive/OneDrive...) để học viên xem trước/sau buổi học.
- Chat trực tiếp giữa giáo viên và học viên (theo từng khóa học, cập nhật realtime).
- Điểm danh tự động: ghi nhận giờ vào/ra khi học viên bấm "Vào lớp".

## Bước 1 — Tạo Supabase project

1. Vào [supabase.com](https://supabase.com) → **New Project** → chọn region Singapore → tạo.
2. Vào **SQL Editor** → **New query** → mở file `supabase/setup.sql`, copy toàn bộ, dán vào, bấm
   **Run**. **Chỉ 1 file, chạy 1 lần** — xong phần database.
3. Vào **Project Settings → API**, copy `Project URL` và `anon public key`.

## Bước 2 — Chạy thử ở máy local (khuyến nghị trước khi deploy)

```bash
npm install
cp .env.example .env.local
```

Dán `Project URL` và `anon key` vào `.env.local`, rồi:

```bash
npm run seed    # tạo 1 giáo viên + 3 học viên + 2 khóa học mẫu
npm run dev
```

Mở http://localhost:3000, đăng nhập thử bằng `teacher@nihongo-itms.demo` / `Demo123!`.

> Nếu Supabase project của bạn đang bật "Confirm email" (mặc định), tài khoản seed cần xác nhận
> email trước khi đăng nhập được. Cách nhanh nhất: vào Supabase → **Authentication → Settings**
> → tắt "Confirm email" (chỉ nên tắt tạm để test, bật lại khi dùng thật).

## Bước 3 — Deploy lên Vercel

1. Đưa code lên GitHub:
   ```bash
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<ban>/nihongo-itms-lite.git
   git push -u origin main
   ```
2. Vào [vercel.com](https://vercel.com) → **Add New Project** → chọn repo vừa push.
3. Ở mục **Environment Variables**, thêm đúng 2 biến:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (từ Bước 1) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (từ Bước 1) |

4. Bấm **Deploy**. Xong.

## Bước 4 — Dùng thật (không phải demo)

- Tạo tài khoản Giáo viên thật qua trang **Đăng ký** (chọn "Giáo viên").
- Đăng nhập, bấm **Tạo khóa học**, điền trình độ + lịch học.
- Vào khóa học vừa tạo → **Tạo buổi học** cho từng buổi (ngày giờ, để trống link video call nếu
  muốn dùng Jitsi có sẵn).
- Học viên vào trang chủ, chọn khóa học phù hợp, **Đăng ký** → giáo viên vào Dashboard duyệt.
- Đến giờ học, cả hai vào `/dashboard`, bấm **Vào lớp**.

## Vì sao đơn giản hơn bản đầy đủ

So với bản đầy đủ (Admin, bài tập/quiz, thư viện học liệu, upload file PPT/PDF lên Storage...),
bản này bỏ:
- Vai trò Admin (giáo viên tự quản lý khóa học của mình, tự duyệt học viên).
- Hệ thống bài tập/chấm điểm/thư viện học liệu.
- Upload & lưu trữ file trên nền tảng (Supabase Storage) — thay bằng share-screen trực tiếp lúc
  dạy + dán link tài liệu ngoài (Drive/OneDrive).

→ Chỉ 6 bảng database (so với 16), chỉ cần 2 biến môi trường, chỉ 1 file SQL, không cần
`SUPABASE_SERVICE_ROLE_KEY` để chạy production.

## Nếu sau này muốn mở rộng lại

Có thể thêm dần: vai trò Admin, upload tài liệu lên Supabase Storage, bài tập/quiz, thư viện học
liệu — mỗi phần là 1 bảng + vài trang, không phải viết lại từ đầu.
