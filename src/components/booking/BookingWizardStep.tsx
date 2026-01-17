import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BookingWizardStepProps {
  steps: Step[];
  currentStepId: string;
}

export function BookingWizardStep({ steps, currentStepId }: BookingWizardStepProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <div className="w-full px-4">
      {/* Progress bar */}
      <div className="relative h-1 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 gradient-burgundy rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step indicators - mobile optimized */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted
                    ? "bg-success text-white"
                    : isCurrent
                    ? "gradient-burgundy text-cream shadow-lg scale-110"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[60px] hidden sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
