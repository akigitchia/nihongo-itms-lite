import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sumi-100 bg-sumi-50/50 px-6 py-12 text-center">
      <Icon className="mb-3 h-10 w-10 text-sumi-400" />
      <p className="font-medium text-sumi-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-sumi-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
