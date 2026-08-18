import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../lib/utils";
import { THEME } from "../config/theme";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "destructive" | "link";
  size?: "md" | "icon" | "sm" | "lg";
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-2 w-auto transition-all duration-150 ease-out rounded-lg font-medium",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
          {
            // Primary: uses theme accent color
            [`bg-[${THEME.colors.primary.DEFAULT}] text-white hover:bg-[${THEME.colors.primary.hover}] shadow-sm focus:ring-[${THEME.colors.primary.DEFAULT}]`]: variant === "primary",
            // Secondary: explicit text color for readability
            "bg-[var(--framer-color-bg-tertiary)] text-[var(--framer-color-text-primary)] hover:bg-[var(--framer-color-bg-secondary)] hover:shadow-sm active:bg-[#e5e7eb] disabled:bg-[var(--framer-color-bg-tertiary)] focus:ring-gray-300":
              variant === "secondary",
            [`bg-[${THEME.colors.error.DEFAULT}] hover:bg-[${THEME.colors.error.dark}] focus:bg-[${THEME.colors.error.dark}] active:bg-[${THEME.colors.error.dark}] disabled:bg-[${THEME.colors.error.DEFAULT}] text-white focus:ring-[${THEME.colors.error.DEFAULT}]`]:
              variant === "danger" || variant === "destructive",
            [`bg-[${THEME.colors.success.DEFAULT}] hover:bg-[${THEME.colors.success.dark}] focus:bg-[${THEME.colors.success.dark}] active:bg-[${THEME.colors.success.dark}] disabled:bg-[${THEME.colors.success.DEFAULT}] text-white focus:ring-[${THEME.colors.success.DEFAULT}]`]:
              variant === "success",
            "bg-transparent hover:bg-[var(--framer-color-bg-tertiary)] text-[var(--framer-color-text-primary)] focus:ring-gray-300":
              variant === "ghost",
            [`bg-transparent hover:underline text-[${THEME.colors.primary.DEFAULT}] p-0 h-auto focus:ring-0 active:scale-100`]:
              variant === "link",
          },
          {
            "h-9 px-6 text-sm": size === "lg",
            "h-7.5 px-2.5 text-sm": size === "md",
            "h-6 px-2 text-xs": size === "sm",
            "h-7.5 w-7.5 p-0": size === "icon",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
