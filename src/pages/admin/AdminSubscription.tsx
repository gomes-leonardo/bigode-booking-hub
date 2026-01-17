import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Zap, 
  X, 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart3,
  Bell,
  Sparkles
} from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  recommended?: boolean;
  icon: typeof Crown;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Grátis",
    price: 0,
    period: "para sempre",
    description: "Para experimentar a plataforma",
    icon: Sparkles,
    features: [
      { text: "Até 30 agendamentos/mês", included: true },
      { text: "1 barbeiro", included: true },
      { text: "Fila digital básica", included: true },
      { text: "Dashboard básico", included: true },
      { text: "Notificações WhatsApp", included: false },
      { text: "Relatórios avançados", included: false },
      { text: "Suporte prioritário", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 49.90,
    period: "/mês",
    description: "Agendamento OU Fila Digital",
    icon: Zap,
    features: [
      { text: "Agendamentos ilimitados", included: true },
      { text: "Até 3 barbeiros", included: true },
      { text: "Fila digital completa", included: true },
      { text: "Dashboard completo", included: true },
      { text: "Notificações WhatsApp", included: false },
      { text: "Relatórios avançados", included: true },
      { text: "Suporte por email", included: true },
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    price: 99.90,
    period: "/mês",
    description: "Agendamento + Fila + WhatsApp",
    icon: Crown,
    recommended: true,
    features: [
      { text: "Agendamentos ilimitados", included: true },
      { text: "Barbeiros ilimitados", included: true },
      { text: "Fila digital completa", included: true },
      { text: "Dashboard avançado", included: true },
      { text: "Notificações WhatsApp", included: true },
      { text: "Relatórios avançados", included: true },
      { text: "Suporte prioritário 24/7", included: true },
    ],
  },
];

export default function AdminSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showTrialBanner, setShowTrialBanner] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Planos & Assinatura
        </h1>
        <p className="text-muted-foreground mt-1">
          Escolha o plano ideal para sua barbearia
        </p>
      </div>

      {/* Trial Banner */}
      {showTrialBanner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent border border-secondary/30 p-4 sm:p-6">
          <button
            onClick={() => setShowTrialBanner(false)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary/20 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-secondary" />
          </button>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
              <Bell className="h-6 w-6 text-charcoal" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                🎉 Você está no período de Teste Grátis
              </h3>
              <p className="text-muted-foreground mt-1">
                Restam <span className="font-bold text-secondary">12 dias</span> para
                experimentar todos os recursos do plano Profissional. Aproveite!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Seu plano atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center">
                <Crown className="h-6 w-6 text-charcoal" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Teste Grátis (Pro)</h3>
                <p className="text-muted-foreground text-sm">
                  Expira em 17 de janeiro de 2026
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-secondary text-secondary">
              Trial
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                plan.recommended
                  ? "border-2 border-secondary shadow-glow scale-[1.02] bg-gradient-to-br from-card via-card to-secondary/5"
                  : "card-elegant hover:shadow-elegant-lg"
              }`}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute top-0 right-0">
                  <div className="bg-secondary text-charcoal text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    RECOMENDADO
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.recommended
                        ? "gradient-gold"
                        : plan.id === "premium"
                        ? "gradient-burgundy"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        plan.recommended || plan.id === "premium"
                          ? plan.id === "premium"
                            ? "text-cream"
                            : "text-charcoal"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price === 0 ? "Grátis" : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-3 text-sm ${
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {feature.included ? (
                        <Check className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className="w-full mt-4"
                  variant={plan.recommended ? "gold" : plan.id === "premium" ? "burgundy" : "outline"}
                  size="lg"
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.price === 0
                    ? "Plano Atual"
                    : plan.recommended
                    ? "Assinar Agora"
                    : "Escolher Plano"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-lg">O que está incluso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Agendamento Online</h4>
                <p className="text-sm text-muted-foreground">
                  Links personalizados para cada cliente
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-medium">Fila Digital</h4>
                <p className="text-sm text-muted-foreground">
                  Sistema estilo Outback para sua barbearia
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-success" />
              </div>
              <div>
                <h4 className="font-medium">WhatsApp Integrado</h4>
                <p className="text-sm text-muted-foreground">
                  Notificações automáticas para clientes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <h4 className="font-medium">Relatórios</h4>
                <p className="text-sm text-muted-foreground">
                  Métricas completas do seu negócio
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
