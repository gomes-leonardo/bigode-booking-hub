import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Clock, LogOut, Users, Zap, Timer, Sparkles } from "lucide-react";

interface PremiumQueueTicketProps {
  position: number;
  estimatedWaitTime: number;
  queueLength: number;
  barberName: string;
  onLeaveQueue: () => void;
  isLoading?: boolean;
}

export function PremiumQueueTicket({
  position,
  estimatedWaitTime,
  queueLength,
  barberName,
  onLeaveQueue,
  isLoading,
}: PremiumQueueTicketProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

  // Safely handle potentially missing number values
  const safePosition = typeof position === 'number' && !isNaN(position) ? position : 0;
  const safeWaitTime = typeof estimatedWaitTime === 'number' && !isNaN(estimatedWaitTime) ? estimatedWaitTime : 0;
  const safeQueueLength = typeof queueLength === 'number' && !isNaN(queueLength) ? queueLength : 0;

  useEffect(() => {
    if (safePosition === 1) {
      const interval = setInterval(() => {
        setPulseScale((prev) => (prev === 1 ? 1.02 : 1));
      }, 800);
      return () => clearInterval(interval);
    } else {
        setPulseScale(1);
    }
  }, [safePosition]);

  const getStatusConfig = () => {
    if (safePosition === 1) {
      return {
        label: "SUA VEZ",
        description: "Dirija-se à cadeira",
        borderColor: "border-gold",
        textColor: "text-gold",
        bgGradient: "from-gold/20 via-gold/10 to-transparent",
        icon: Zap,
        iconColor: "text-gold",
        pulse: true,
      };
    }
    if (safePosition === 2) {
      return {
        label: "PRÓXIMO",
        description: "Prepare-se",
        borderColor: "border-burgundy",
        textColor: "text-burgundy",
        bgGradient: "from-burgundy/20 via-burgundy/10 to-transparent",
        icon: Timer,
        iconColor: "text-burgundy",
        pulse: true,
      };
    }
    return {
      label: "NA FILA",
      description: "Aguarde sua vez",
      borderColor: "border-zinc-700",
      textColor: "text-muted-foreground",
      bgGradient: "from-zinc-800/50 to-transparent",
      icon: Clock,
      iconColor: "text-zinc-500",
      pulse: false,
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <div 
        className={cn(
            "relative overflow-hidden rounded-xl bg-card border-2 shadow-2xl transition-all duration-500",
            status.borderColor
        )}
        style={{ transform: `scale(${pulseScale})` }}
      >
        {/* Decorative Top Border */}
        <div className={cn("absolute top-0 left-0 right-0 h-1.5 w-full", 
            safePosition === 1 ? "bg-gold" : safePosition === 2 ? "bg-burgundy" : "bg-zinc-700"
        )} />

        {/* Content */}
        <div className="p-6 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Fila de Espera
            </p>
            <h3 className="font-display text-2xl font-bold text-foreground">
              {barberName || "Barbeiro"}
            </h3>
          </div>

          {/* Main Number Display */}
          <div className="relative py-6 flex justify-center items-center">
            {/* Background Glow */}
            <div className={cn(
                "absolute inset-0 mx-auto w-40 h-40 rounded-full blur-3xl opacity-20",
                safePosition === 1 ? "bg-gold" : safePosition === 2 ? "bg-burgundy" : "bg-zinc-500"
            )} />

            <div className={cn(
                "relative z-10 flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 bg-background shadow-xl",
                status.borderColor
            )}>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-[-5px]">Posição</span>
                <span className={cn("text-6xl font-display font-bold", status.textColor)}>
                    {String(safePosition).padStart(2, "0")}
                </span>
            </div>

            {/* Status Badge - Floating */}
            <div className={cn(
                "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-4 py-1.5 rounded-full border bg-background shadow-lg flex items-center gap-2 whitespace-nowrap",
                status.borderColor
            )}>
                <StatusIcon className={cn("w-3.5 h-3.5", status.iconColor)} />
                <span className={cn("text-xs font-bold tracking-wider", status.textColor)}>
                    {status.label}
                </span>
            </div>
          </div>

          {/* Info Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tempo Est.</p>
                <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="font-bold text-foreground">{formatWaitTime(safeWaitTime)}</span>
                </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Na Fila</p>
                <div className="flex items-center justify-center gap-1.5">
                    <Users className="w-4 h-4 text-burgundy" />
                    <span className="font-bold text-foreground">{safeQueueLength}</span>
                </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-6 text-center">
             <p className="text-sm text-muted-foreground">
                {status.description}
             </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-muted/20 border-t border-border/50">
             <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-10"
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da Fila
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sair da fila?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja sair da fila? Você perderá sua posição
                  atual e precisará entrar novamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onLeaveQueue}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Sim, sair da fila
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
