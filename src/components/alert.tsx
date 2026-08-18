import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { THEME } from "../config/theme";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--framer-color-bg)] text-[var(--framer-color-text-primary)] border-[var(--framer-color-divider)] [&>svg]:text-[var(--framer-color-text-secondary)]",
        info: `border-[${THEME.colors.primary.DEFAULT}]/50 bg-[${THEME.colors.primary.light}] text-[var(--framer-color-text-primary)] [&>svg]:text-[${THEME.colors.primary.DEFAULT}]`,
        destructive:
          `border-[${THEME.colors.error.DEFAULT}]/50 bg-[${THEME.colors.error.light}] text-red-700 dark:text-red-300 [&>svg]:text-[${THEME.colors.error.DEFAULT}]`,
        success:
          `border-[${THEME.colors.success.DEFAULT}]/50 bg-[${THEME.colors.success.light}] text-green-700 dark:text-green-300 [&>svg]:text-[${THEME.colors.success.DEFAULT}]`,
        warning:
          `border-[${THEME.colors.warning.DEFAULT}]/50 bg-[${THEME.colors.warning.light}] text-orange-700 dark:text-orange-300 [&>svg]:text-[${THEME.colors.warning.DEFAULT}]`,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

