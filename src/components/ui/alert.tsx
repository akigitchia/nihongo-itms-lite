import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
const config: Record<Tone, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  error: { icon: AlertTriangle, classes: "bg-shu-50 text-shu-600 border-shu-100" },
  info: { icon: Info, classes: "bg-navy-50 text-navy-700 border-navy-100" },
};
export function Alert({ tone = "info", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const { icon: Icon, classes } = config[tone];
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", classes, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
