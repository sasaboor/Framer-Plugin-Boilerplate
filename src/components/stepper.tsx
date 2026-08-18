import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-start">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Column */}
            <div className="flex flex-col items-center min-w-0" style={{ width: `${100 / steps.length}%` }}>
              {/* Step Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shrink-0",
                  currentStep > step.number
                    ? "bg-green-500 text-white shadow-md"
                    : currentStep === step.number
                    ? "bg-[#0099FF] text-white shadow-lg shadow-[#0099FF]/30"
                    : "bg-[var(--framer-color-bg-tertiary)] text-[var(--framer-color-text-tertiary)] border-2 border-[var(--framer-color-divider)]"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300 mt-2 text-center px-1",
                  currentStep >= step.number
                    ? "text-[var(--framer-color-text-primary)]"
                    : "text-[var(--framer-color-text-tertiary)]"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex items-center pt-5 px-2">
                <div className="h-1 w-full rounded-full overflow-hidden bg-[var(--framer-color-bg-tertiary)]" style={{ minWidth: '40px' }}>
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      currentStep > step.number
                        ? "bg-green-500 w-full"
                        : "bg-transparent w-0"
                    )}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Named export for compatibility
export { Stepper };
