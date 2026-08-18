import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { cn } from "../lib/utils";

export interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  score: number; // 0-100
  issueCount: number;
  onClick?: () => void;
  className?: string;
}

const getScoreBadgeVariant = (score: number) => {
  if (score >= 80) return "success" as const;
  if (score >= 60) return "warning" as const;
  return "destructive" as const;
};

export default function CategoryCard({
  title,
  icon,
  score,
  issueCount,
  onClick,
  className,
}: CategoryCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-[#0099FF]/50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-4 space-y-3">
        {/* Icon and Score Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[var(--framer-color-bg-tertiary)]">
              <div className="text-[var(--framer-color-text-secondary)]">
                {icon}
              </div>
            </div>
          </div>
          <Badge variant={getScoreBadgeVariant(score)} className="text-xs">
            {score}
          </Badge>
        </div>

        {/* Category Name and Issue Count */}
        <div>
          <div className="text-sm font-semibold text-[var(--framer-color-text-primary)]">
            {title}
          </div>
          <div className="text-xs text-[var(--framer-color-text-secondary)] mt-0.5">
            {issueCount} {issueCount === 1 ? "issue" : "issues"}
          </div>
        </div>

        {/* Mini Progress Bar */}
        <Progress value={score} className="h-1" />
      </CardContent>
    </Card>
  );
}

