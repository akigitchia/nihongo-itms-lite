import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("h-10 w-full rounded-lg border border-sumi-100 bg-white px-3 text-sm text-sumi-900 placeholder:text-sumi-400 focus:outline-none focus:ring-2 focus:ring-navy-700", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("w-full rounded-lg border border-sumi-100 bg-white px-3 py-2 text-sm text-sumi-900 placeholder:text-sumi-400 focus:outline-none focus:ring-2 focus:ring-navy-700", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn("h-10 w-full rounded-lg border border-sumi-100 bg-white px-3 text-sm text-sumi-900 focus:outline-none focus:ring-2 focus:ring-navy-700", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-sumi-900", className)} {...props} />;
}
export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-shu-500">{children}</p>;
}
