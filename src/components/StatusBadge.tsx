import { Badge } from "./badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

export interface StatusBadgeProps {
  status: "ready" | "warning" | "critical";
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  ready: {
    variant: "success" as const,
    label: "Ready",
    icon: CheckCircle2,
  },
  warning: {
    variant: "warning" as const,
    label: "Needs Work",
    icon: AlertTriangle,
  },
  critical: {
    variant: "destructive" as const,
    label: "Critical Issues",
    icon: XCircle,
  },
};

export default function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <Badge variant={config.variant} className={cn("flex items-center gap-1.5", className)}>
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{displayLabel}</span>
    </Badge>
  );
}

