import { InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export default function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "w-4 h-4 rounded border border-[var(--framer-color-divider)] bg-[var(--framer-color-bg)] cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-[#0099FF] focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  );
}

// Named export for compatibility
export { Checkbox };
