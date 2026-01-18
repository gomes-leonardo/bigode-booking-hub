import { cn } from "@/lib/utils";
import { User, Scissors, Calendar, Clock, CheckCircle2, Check } from "lucide-react";

type Step = "loading" | "barber" | "barber-detail" | "appointments-view" | "queue-join" | "queue-position" | "service" | "date" | "time" | "confirmation" | "success";

interface BookingStepperProps {
  currentStep: Step;
  preSelectedBarberId: string | null;
}

export function BookingStepper({ currentStep, preSelectedBarberId }: BookingStepperProps) {
  const steps = [
    { id: "barber", label: "Barbeiro", icon: User },
    { id: "service", label: "Serviço", icon: Scissors },
    { id: "date", label: "Data", icon: Calendar },
    { id: "time", label: "Horário", icon: Clock },
    { id: "confirmation", label: "Confirmar", icon: CheckCircle2 },
  ];

  const getStepIndex = (stepId: string) => {
    const stepOrder = ["barber", "barber-detail", "appointments-view", "queue-join", "queue-position", "service", "date", "time", "confirmation", "success"];
    return stepOrder.indexOf(stepId);
  };

  const currentStepIndex = getStepIndex(currentStep);
  const visibleSteps = preSelectedBarberId ? steps.slice(1) : steps;

  const isStepCompleted = (stepId: string) => {
    const stepOrderMap: Record<string, number> = {
      barber: 0,
      service: 5,
      date: 6,
      time: 7,
      confirmation: 8,
    };
    return currentStepIndex > stepOrderMap[stepId];
  };

  const isStepActive = (stepId: string) => {
    if (stepId === "barber") return ["barber", "barber-detail", "appointments-view", "queue-join", "queue-position"].includes(currentStep);
    if (stepId === "service") return currentStep === "service";
    if (stepId === "date") return currentStep === "date";
    if (stepId === "time") return currentStep === "time";
    if (stepId === "confirmation") return currentStep === "confirmation" || currentStep === "success";
    return false;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Desktop Version */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-border/50" />
        
        {/* Progress Line Active */}
        <div 
          className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-secondary via-secondary to-primary transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(100, (visibleSteps.findIndex(s => isStepActive(s.id)) / (visibleSteps.length - 1)) * 100)}%`,
          }}
        />

        {visibleSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = isStepActive(step.id);
          const isCompleted = isStepCompleted(step.id);

          return (
            <div key={step.id} className="relative flex flex-col items-center z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  "ring-4 ring-background",
                  isCompleted && "bg-success text-white shadow-lg shadow-success/30",
                  isActive && !isCompleted && "bg-gradient-to-br from-secondary to-primary text-charcoal shadow-lg shadow-secondary/30 scale-110",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
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
                  "mt-2 text-xs font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Version - Pill Style */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 px-4">
        {visibleSteps.map((step, index) => {
          const isActive = isStepActive(step.id);
          const isCompleted = isStepCompleted(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300",
                  isCompleted && "bg-success/20",
                  isActive && !isCompleted && "bg-gradient-to-r from-secondary/20 to-primary/20 ring-1 ring-secondary/50",
                  !isActive && !isCompleted && "bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-success text-white",
                    isActive && !isCompleted && "bg-gradient-to-br from-secondary to-primary text-charcoal",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                {isActive && (
                  <span className="text-xs font-semibold text-foreground pr-1">
                    {step.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
