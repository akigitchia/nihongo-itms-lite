import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "shu" | "green" | "amber" | "gray" | "red";
const toneClasses: Record<Tone, string> = {
  navy: "bg-navy-50 text-navy-700",
  shu: "bg-shu-50 text-shu-600",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  gray: "bg-sumi-100 text-sumi-600",
  red: "bg-red-50 text-red-600",
};
export function Badge({ tone = "gray", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", toneClasses[tone], className)} {...props} />;
}
