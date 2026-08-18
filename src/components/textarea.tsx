import { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-[var(--framer-color-divider)] bg-[var(--framer-color-bg)] px-3 py-2 text-sm",
        "text-[var(--framer-color-text-primary)] placeholder:text-[var(--framer-color-text-tertiary)]",
        "focus:outline-none focus:ring-2 focus:ring-[#0099FF] focus:ring-offset-0 focus:border-[#0099FF]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--framer-color-bg-tertiary)]",
        "resize-y transition-all duration-150",
        className
      )}
      {...props}
    />
  );
}
