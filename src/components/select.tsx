import { SelectHTMLAttributes } from "react";
import { cn } from "../lib/utils";

interface SelectProps<T = string>
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "children"
  > {
  onChange?: (value: T) => void;
  items: { label: string; value: T }[];
}

export default function Select<T>({
  className,
  onChange,
  items,
  ...props
}: SelectProps<T>) {
  return (
    <select
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--framer-color-divider)] bg-[var(--framer-color-bg)] px-3 py-2 text-sm",
        "text-[var(--framer-color-text-primary)]",
        "focus:outline-none focus:ring-2 focus:ring-[#0099FF] focus:ring-offset-0 focus:border-[#0099FF]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--framer-color-bg-tertiary)]",
        "transition-all duration-150",
        "cursor-pointer",
        className
      )}
      {...props}
      onChange={(e) =>
        onChange?.(
          items.find((item) => item.label === e.target.value)?.value as T
        )
      }
    >
      {items.map((item, i) => (
        <option key={i} value={item.label}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export { Select };
