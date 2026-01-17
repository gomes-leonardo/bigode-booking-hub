import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({ slots, selectedSlot, onSelect }: TimeSlotGridProps) {
  // Group slots by period
  const groupSlots = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlots(slots);

  const PeriodSection = ({
    title,
    icon,
    slots,
  }: {
    title: string;
    icon: string;
    slots: TimeSlot[];
  }) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => {
            const isSelected =
              selectedSlot?.startTime === slot.startTime &&
              selectedSlot?.endTime === slot.endTime;

            return (
              <button
                key={slot.startTime}
                onClick={() => onSelect(slot)}
                className={cn(
                  "min-h-[52px] px-3 py-2 rounded-xl font-medium transition-all duration-200 touch-manipulation active:scale-95",
                  isSelected
                    ? "gradient-burgundy text-cream shadow-lg ring-2 ring-primary/30"
                    : "bg-card border border-border hover:border-primary/50 hover:shadow-md text-foreground"
                )}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className={cn("h-4 w-4", isSelected ? "text-cream/80" : "text-muted-foreground")} />
                  <span>{slot.startTime}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum horário disponível para esta data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PeriodSection title="Manhã" icon="🌅" slots={morning} />
      <PeriodSection title="Tarde" icon="☀️" slots={afternoon} />
      <PeriodSection title="Noite" icon="🌙" slots={evening} />
    </div>
  );
}
