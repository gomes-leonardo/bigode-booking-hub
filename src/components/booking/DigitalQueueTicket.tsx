import { useState } from "react";
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
import { Clock, LogOut, Users } from "lucide-react";

interface DigitalQueueTicketProps {
  position: number;
  estimatedWaitTime: number;
  queueLength: number;
  barberName: string;
  onLeaveQueue: () => void;
  isLoading?: boolean;
}

export function DigitalQueueTicket({
  position,
  estimatedWaitTime,
  queueLength,
  barberName,
  onLeaveQueue,
  isLoading,
}: DigitalQueueTicketProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getStatusConfig = () => {
    if (position === 1) {
      return {
        label: "É A SUA VEZ!",
        color: "bg-success",
        pulse: true,
        description: "Dirija-se ao barbeiro",
      };
    }
    if (position === 2) {
      return {
        label: "PRÓXIMO",
        color: "bg-secondary",
        pulse: true,
        description: "Prepare-se, você é o próximo",
      };
    }
    return {
      label: "AGUARDANDO",
      color: "bg-primary",
      pulse: false,
      description: "Aguarde sua vez na fila",
    };
  };

  const status = getStatusConfig();

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Ticket Card with glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal to-charcoal-light border border-border/20 shadow-elegant-lg">
        {/* Top decorative bar */}
        <div className="h-2 gradient-gold" />

        {/* Main content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <p className="text-cream/60 text-sm uppercase tracking-wider mb-1">
              Fila do barbeiro
            </p>
            <h3 className="text-cream font-display text-xl font-bold">
              {barberName}
            </h3>
          </div>

          {/* Position - HUGE */}
          <div className="text-center py-6">
            <div className="relative inline-block">
              <span className="text-8xl sm:text-9xl font-bold text-gradient-gold tracking-tight">
                #{String(position).padStart(2, "0")}
              </span>
              {status.pulse && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-success animate-ping" />
              )}
            </div>
            <p className="text-cream/60 text-sm mt-2">Sua posição na fila</p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div
              className={cn(
                "px-6 py-3 rounded-full text-center",
                status.color,
                status.pulse && "animate-pulse-subtle"
              )}
            >
              <span className="font-bold text-white text-lg tracking-wide">
                {status.label}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-cream/60" />
              <p className="text-2xl font-bold text-cream">
                ~{estimatedWaitTime} min
              </p>
              <p className="text-xs text-cream/50 mt-1">Tempo estimado</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-cream/60" />
              <p className="text-2xl font-bold text-cream">{queueLength}</p>
              <p className="text-xs text-cream/50 mt-1">Pessoas na fila</p>
            </div>
          </div>

          {/* Status description */}
          <p className="text-center text-cream/70 text-sm">
            {status.description}
          </p>

          {/* Leave Queue Button */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/30"
                disabled={isLoading}
              >
                <LogOut className="h-5 w-5" />
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
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sim, sair da fila
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Bottom decorative elements */}
        <div className="flex justify-center pb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full",
                  i < position ? "bg-secondary/30" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
