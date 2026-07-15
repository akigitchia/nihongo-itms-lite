import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateVi(dateString: string | null | undefined) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(dateString));
}

export function formatTimeVi(dateString: string | null | undefined) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));
}

/** Học viên/giáo viên chỉ được "Vào lớp" trong khoảng 15 phút trước giờ học đến khi kết thúc + 15 phút. */
export function getSessionJoinWindow(sessionDate: string, durationMinutes: number) {
  const start = new Date(sessionDate).getTime();
  const end = start + durationMinutes * 60000;
  const now = Date.now();
  const opensAt = start - 15 * 60000;
  const closesAt = end + 15 * 60000;
  return {
    canJoin: now >= opensAt && now <= closesAt,
    hasEnded: now > closesAt,
    opensAt,
  };
}
