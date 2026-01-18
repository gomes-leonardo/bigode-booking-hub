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

  // Heartbeat animation for position 1
  useEffect(() => {
    if (position === 1) {
      const interval = setInterval(() => {
        setPulseScale((prev) => (prev === 1 ? 1.05 : 1));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [position]);

  const getStatusConfig = () => {
    if (position === 1) {
      return {
        label: "É A SUA VEZ!",
        sublabel: "Dirija-se ao barbeiro agora",
        bgGradient: "from-emerald-500 via-green-500 to-teal-500",
        textColor: "text-white",
        iconColor: "text-white",
        ringColor: "ring-emerald-400",
        glowColor: "shadow-emerald-500/50",
        icon: Zap,
        animate: true,
      };
    }
    if (position === 2) {
      return {
        label: "PRÓXIMO",
        sublabel: "Prepare-se, você é o próximo",
        bgGradient: "from-amber-500 via-yellow-500 to-orange-400",
        textColor: "text-charcoal",
        iconColor: "text-charcoal",
        ringColor: "ring-amber-400",
        glowColor: "shadow-amber-500/40",
        icon: Timer,
        animate: true,
      };
    }
    return {
      label: "AGUARDANDO",
      sublabel: "Aguarde sua vez na fila",
      bgGradient: "from-slate-600 via-slate-500 to-slate-600",
      textColor: "text-white",
      iconColor: "text-white/80",
      ringColor: "ring-slate-400",
      glowColor: "shadow-slate-500/30",
      icon: Clock,
      animate: false,
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
      {/* Main Ticket Container */}
      <div 
        className="relative overflow-hidden rounded-3xl transition-transform duration-300"
        style={{ transform: `scale(${pulseScale})` }}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal opacity-95" />
        
        {/* Animated Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={cn(
            "absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl",
            `bg-gradient-to-br ${status.bgGradient}`,
            status.animate && "animate-pulse"
          )} />
          <div className={cn(
            "absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-15 blur-3xl",
            `bg-gradient-to-br ${status.bgGradient}`,
            status.animate && "animate-pulse"
          )} style={{ animationDelay: "1s" }} />
        </div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNiIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* Live Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-cream/90 tracking-wider uppercase">
                Ao Vivo
              </span>
            </div>
          </div>

          {/* Barber Name */}
          <div className="text-center mb-6">
            <p className="text-cream/50 text-xs uppercase tracking-[0.3em] mb-1">
              Fila de
            </p>
            <h3 className="text-cream font-display text-xl font-bold tracking-wide">
              {barberName}
            </h3>
          </div>

          {/* Position Display - THE HERO */}
          <div className="relative flex justify-center mb-8">
            {/* Outer Ring */}
            <div className={cn(
              "absolute inset-0 m-auto w-44 h-44 rounded-full",
              status.animate && "animate-spin-slow"
            )}>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-cream/10"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {/* Inner Glow Ring */}
            <div className={cn(
              "absolute inset-0 m-auto w-36 h-36 rounded-full ring-2",
              status.ringColor,
              "opacity-30",
              status.animate && "animate-pulse"
            )} />

            {/* Main Circle */}
            <div className={cn(
              "relative w-32 h-32 rounded-full flex items-center justify-center",
              "bg-gradient-to-br",
              status.bgGradient,
              "shadow-2xl",
              status.glowColor,
              "transition-all duration-500"
            )}>
              {/* Inner Highlight */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
              
              {/* Position Number */}
              <div className="relative text-center">
                <span className={cn(
                  "text-5xl sm:text-6xl font-black tracking-tighter",
                  status.textColor
                )}>
                  {String(position).padStart(2, "0")}
                </span>
              </div>

              {/* Sparkle Effect for Position 1 */}
              {position === 1 && (
                <>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
                  <Sparkles className="absolute -bottom-1 -left-3 w-4 h-4 text-yellow-300 animate-pulse" style={{ animationDelay: "0.5s" }} />
                </>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
              "bg-gradient-to-r",
              status.bgGradient,
              "shadow-lg",
              status.glowColor
            )}>
              <StatusIcon className={cn("w-4 h-4", status.textColor)} />
              <span className={cn(
                "font-bold text-sm tracking-wider",
                status.textColor
              )}>
                {status.label}
              </span>
            </div>
            <p className="text-cream/60 text-sm">{status.sublabel}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm p-4 text-center group hover:bg-white/10 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="relative">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-secondary" />
                </div>
                <p className="text-2xl font-bold text-cream">
                  {formatWaitTime(estimatedWaitTime)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-cream/40 mt-1">
                  Tempo estimado
                </p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm p-4 text-center group hover:bg-white/10 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="relative">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-cream">{queueLength}</p>
                <p className="text-[10px] uppercase tracking-wider text-cream/40 mt-1">
                  Na fila
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-cream/40 mb-2">
              <span>Progresso</span>
              <span>{Math.max(0, 100 - (position - 1) * 20)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  "bg-gradient-to-r",
                  status.bgGradient
                )}
                style={{
                  width: `${Math.max(10, 100 - (position - 1) * 20)}%`,
                }}
              />
            </div>
          </div>

          {/* Leave Queue Button */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-xl h-12 transition-all duration-300"
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da Fila
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-charcoal border-border/50">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-cream">Sair da fila?</AlertDialogTitle>
                <AlertDialogDescription className="text-cream/70">
                  Tem certeza que deseja sair da fila? Você perderá sua posição
                  atual e precisará entrar novamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/10 border-white/20 text-cream hover:bg-white/20">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onLeaveQueue}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Sim, sair da fila
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Bottom Decorative Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      </div>

      {/* Ticket Shadow/Reflection */}
      <div className="h-8 mx-4 -mt-4 rounded-b-3xl bg-gradient-to-b from-black/20 to-transparent blur-xl" />
    </div>
  );
}
