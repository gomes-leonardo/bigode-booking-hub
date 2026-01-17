import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";

interface HorizontalDatePickerProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  disabledDays?: number[]; // 0 = Sunday, 6 = Saturday
  daysToShow?: number;
}

export function HorizontalDatePicker({
  selectedDate,
  onSelect,
  disabledDays = [],
  daysToShow = 30,
}: HorizontalDatePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());
  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));

  const isDisabled = (date: Date) => {
    if (isBefore(date, today)) return true;
    return disabledDays.includes(date.getDay());
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll to selected date
  useEffect(() => {
    if (selectedDate && scrollRef.current) {
      const index = dates.findIndex((d) => isSameDay(d, selectedDate));
      if (index > 0) {
        const itemWidth = 72; // approximate width of each item
        scrollRef.current.scrollTo({
          left: index * itemWidth - 100,
          behavior: "smooth",
        });
      }
    }
  }, [selectedDate]);

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Date scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-12 py-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dates.map((date) => {
          const disabled = isDisabled(date);
          const selected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition-all duration-200 snap-center touch-manipulation",
                disabled
                  ? "opacity-40 cursor-not-allowed bg-muted/50"
                  : selected
                  ? "gradient-burgundy text-cream shadow-lg scale-105"
                  : isToday
                  ? "bg-secondary/20 border-2 border-secondary hover:bg-secondary/30"
                  : "bg-card border border-border hover:border-primary/50 hover:shadow-md active:scale-95"
              )}
            >
              <span
                className={cn(
                  "text-xs uppercase font-medium",
                  selected ? "text-cream/80" : "text-muted-foreground"
                )}
              >
                {format(date, "EEE", { locale: ptBR })}
              </span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  selected ? "text-cream" : "text-foreground"
                )}
              >
                {format(date, "dd")}
              </span>
              <span
                className={cn(
                  "text-xs",
                  selected ? "text-cream/80" : "text-muted-foreground"
                )}
              >
                {format(date, "MMM", { locale: ptBR })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
