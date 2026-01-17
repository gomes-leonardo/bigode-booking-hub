import { cn } from "@/lib/utils";
import { Scissors, Clock } from "lucide-react";

interface ServiceCardProps {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isSelected?: boolean;
  onSelect: (id: string) => void;
}

export function ServiceCard({
  id,
  name,
  price,
  duration,
  description,
  isSelected,
  onSelect,
}: ServiceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "w-full min-h-[88px] p-4 rounded-2xl border-2 transition-all duration-200 text-left",
        "active:scale-[0.98] touch-manipulation",
        isSelected
          ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20"
          : "border-border bg-card hover:border-primary/50 hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
            isSelected ? "gradient-burgundy" : "bg-muted"
          )}
        >
          <Scissors
            className={cn(
              "h-6 w-6",
              isSelected ? "text-cream" : "text-muted-foreground"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base text-foreground">{name}</h3>
            <span className="font-bold text-lg text-primary whitespace-nowrap">
              {formatCurrency(price)}
            </span>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{duration} min</span>
          </div>
        </div>
      </div>
    </button>
  );
}
