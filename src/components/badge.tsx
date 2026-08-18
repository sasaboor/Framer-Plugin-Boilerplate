import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { THEME } from "../config/theme";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default:
          `border-transparent bg-[${THEME.colors.primary.DEFAULT}] text-white`,
        secondary:
          "border-transparent bg-[var(--framer-color-bg-secondary)] text-[var(--framer-color-text-secondary)]",
        destructive:
          `border-transparent bg-[${THEME.colors.error.DEFAULT}] text-white`,
        success:
          `border-transparent bg-[${THEME.colors.success.DEFAULT}] text-white`,
        warning:
          `border-transparent bg-[${THEME.colors.warning.DEFAULT}] text-white`,
        outline: "text-[var(--framer-color-text-primary)] border-[var(--framer-color-divider)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

