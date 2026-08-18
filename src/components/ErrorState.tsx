import { useState } from "react";
import { Card, CardContent } from "./card";
import Button from "./button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  errorDetails?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "default" | "inline";
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  errorDetails,
  onRetry,
  retryLabel = "Try Again",
  variant = "default",
  className,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-start gap-2 text-sm text-red-600 dark:text-red-400", className)}>
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <Card className={cn("border-red-500/50 overflow-visible", className)}>
      <CardContent className="pt-6 overflow-visible">
        <div className="text-center space-y-4">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-red-500/10">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[var(--framer-color-text-primary)]">
              {title}
            </h3>
            <p className="text-sm text-[var(--framer-color-text-secondary)] max-w-sm mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          {/* Error Details (Collapsible) */}
          {errorDetails && (
            <Accordion type="single" collapsible className="w-full overflow-visible">
              <AccordionItem value="details" className="border-0 overflow-visible">
                <AccordionTrigger className="text-xs text-[var(--framer-color-text-tertiary)] hover:text-[var(--framer-color-text-secondary)] py-2">
                  View technical details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2 p-3 rounded-md bg-[var(--framer-color-bg-tertiary)] text-left">
                    <pre className="text-xs text-[var(--framer-color-text-secondary)] whitespace-pre-wrap break-words">
                      {errorDetails}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Retry Button */}
          {onRetry && (
            <div className="pt-2">
              <Button onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {retryLabel}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

