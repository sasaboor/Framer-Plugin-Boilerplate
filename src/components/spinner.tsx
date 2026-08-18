import { cn } from "../lib/utils";

export default function Spinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
  };

  return (
    <div
      className={cn(
        "border-[#0099FF] border-t-transparent rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

// Named export for compatibility
export { Spinner };
