import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Star } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

export function PlanSelectionModal() {
  const { hasSelectedPlan, setHasSelectedPlan } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);

  // If plan is already selected, don't show
  if (hasSelectedPlan) return null;

  const handleSelectPlan = async (plan: 'free' | 'pro') => {
    setSelectedPlan(plan);
    setLoading(true);
    
    // Simulate API call to save plan preference
    setTimeout(() => {
        setHasSelectedPlan(true);
        setLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={!hasSelectedPlan} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden [&>button]:hidden">
         <div className="grid md:grid-cols-2">
            
            {/* Left: Branding */}
            <div className="p-8 md:p-12 bg-gradient-to-br from-zinc-900 to-black flex flex-col justify-between border-r border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" />
                         Boas-vindas
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                        Escolha como começar sua jornada
                    </h2>
                    <p className="text-zinc-400 leading-relaxed">
                        O Bigode é a plataforma completa para automatizar sua barbearia. Comece com nosso trial gratuito e veja a mágica acontecer.
                    </p>
                </div>
                <div className="mt-8 space-y-3">
                    {['Agenda Automática', 'Lembretes via WhatsApp', 'Relatórios Financeiros'].map(item => (
                        <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                            </div>
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Plans */}
            <div className="p-8 md:p-12 bg-zinc-950 flex flex-col justify-center gap-6">
                
                {/* Free Trial Card */}
                <button 
                    onClick={() => handleSelectPlan('free')}
                    disabled={loading}
                    className={cn(
                        "group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02]",
                        selectedPlan === 'free' ? "border-gold bg-gold/5" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                    )}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-white text-lg">Trial Gratuito</h3>
                            <p className="text-zinc-500 text-sm">Para quem está começando</p>
                        </div>
                        <div className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2 py-1 rounded">
                            7 DIAS
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">R$ 0</span>
                        <span className="text-zinc-500 text-sm">/dia</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                         <li className="text-xs text-zinc-400 flex gap-2"><Check className="w-3 h-3 text-zinc-600" /> Todas as funcionalidades</li>
                         <li className="text-xs text-zinc-400 flex gap-2"><Check className="w-3 h-3 text-zinc-600" /> Sem compromisso</li>
                    </ul>
                </button>

                 {/* Pro Card */}
                 <button 
                    onClick={() => handleSelectPlan('pro')}
                    disabled={loading}
                    className={cn(
                        "group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02]",
                        selectedPlan === 'pro' ? "border-burgundy bg-burgundy/5" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                    )}
                >
                     <div className="absolute -top-3 right-4 bg-gradient-to-r from-burgundy to-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                        MAIS POPULAR
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-white text-lg">Pro</h3>
                            <p className="text-zinc-500 text-sm">Para barbearias em crescimento</p>
                        </div>
                        <div className="bg-burgundy/20 text-burgundy text-xs font-bold px-2 py-1 rounded">
                            <Star className="w-3 h-3 inline mr-1" />
                            OFC
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">R$ 89</span>
                        <span className="text-zinc-500 text-sm">/mês</span>
                    </div>
                     <p className="text-xs text-zinc-500 mt-2">Cancele quando quiser.</p>
                </button>
                
                {loading && (
                    <div className="text-center text-sm text-muted-foreground animate-pulse mt-2 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Configurando sua conta...
                    </div>
                )}
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}
