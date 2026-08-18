import { Card, CardContent } from "./card";
import Button from "./button";
import { FileSearch, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "no-data" | "search";
  className?: string;
}

const variantIcons = {
  default: <Sparkles className="w-12 h-12 text-[#0099FF]" />,
  "no-data": <FileSearch className="w-12 h-12 text-[var(--framer-color-text-tertiary)]" />,
  search: <FileSearch className="w-12 h-12 text-[var(--framer-color-text-tertiary)]" />,
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  variant = "default",
  className,
}: EmptyStateProps) {
  const displayIcon = icon || variantIcons[variant];

  return (
    <Card className={cn(className)}>
      <CardContent className="pt-6">
        <div className="text-center py-8 space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {displayIcon}
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[var(--framer-color-text-primary)]">
              {title}
            </h3>
            <p className="text-sm text-[var(--framer-color-text-secondary)] max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Button */}
          {actionLabel && onAction && (
            <div className="pt-2">
              <Button onClick={onAction}>
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

