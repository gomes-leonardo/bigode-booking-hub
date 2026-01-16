import { cn } from "@/lib/utils";

interface MustacheLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export function MustacheLogo({ className, size = "md", showText = true }: MustacheLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 100 50"
        className={cn(sizeMap[size], "text-gold")}
        fill="currentColor"
      >
        <path d="M50 25 C40 25, 35 35, 20 35 C10 35, 5 30, 2 25 C5 20, 12 18, 20 20 C30 22, 40 18, 50 15 C60 18, 70 22, 80 20 C88 18, 95 20, 98 25 C95 30, 90 35, 80 35 C65 35, 60 25, 50 25 Z" />
        <ellipse cx="15" cy="28" rx="4" ry="3" opacity="0.3" />
        <ellipse cx="85" cy="28" rx="4" ry="3" opacity="0.3" />
      </svg>
      {showText && (
        <span className={cn("font-display font-bold text-foreground", textSizeMap[size])}>
          Bigode
        </span>
      )}
    </div>
  );
}
