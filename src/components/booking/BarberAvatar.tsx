import { cn } from "@/lib/utils";
import { User, Check } from "lucide-react";

interface BarberAvatarProps {
  id: string;
  name: string;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-20 h-20",
  lg: "w-24 h-24",
};

const iconSizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export function BarberAvatar({
  id,
  name,
  isSelected,
  onSelect,
  size = "md",
}: BarberAvatarProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className="flex flex-col items-center gap-2 touch-manipulation active:scale-95 transition-transform"
    >
      <div className="relative">
        <div
          className={cn(
            "rounded-full flex items-center justify-center transition-all duration-200",
            sizeMap[size],
            isSelected
              ? "gradient-burgundy ring-4 ring-primary/30 shadow-lg"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <User
            className={cn(
              iconSizeMap[size],
              isSelected ? "text-cream" : "text-muted-foreground"
            )}
          />
        </div>
        {isSelected && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-md">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <span
        className={cn(
          "text-sm font-medium text-center max-w-[80px] truncate",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {name}
      </span>
    </button>
  );
}
