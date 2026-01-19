import { MustacheLogo } from "@/components/icons/MustacheLogo";
import { Button } from "@/components/ui/button";
import { 
  CalendarCheck, 
  MessageCircle, 
  Clock, 
  Sparkles,
  ArrowRight,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: MessageCircle,
    title: "Receba o link",
    description: "Seu barbeiro envia um link exclusivo via WhatsApp para você agendar.",
  },
  {
    icon: CalendarCheck,
    title: "Escolha o horário",
    description: "Selecione o dia e horário que melhor encaixam na sua agenda.",
  },
  {
    icon: Check,
    title: "Pronto!",
    description: "Seu agendamento está confirmado. Basta comparecer no horário marcado.",
  },
];

const features = [
  "Agendamento em menos de 1 minuto",
  "Sem criar conta ou baixar app",
  "Confirmação instantânea",
  "Lembretes automáticos via WhatsApp",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <MustacheLogo size="xl" showText className="text-cream" />
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream mb-6 leading-tight">
              Seu horário, <span className="text-gradient-gold">sem complicação</span>
            </h1>

            <p className="text-lg md:text-xl text-cream/70 mb-8 max-w-2xl mx-auto">
              Agende seu corte de cabelo ou barba em segundos, direto pelo WhatsApp. 
              Sem apps, sem cadastros, sem complicação.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin/login">
                <Button variant="gold" size="xl">
                  Sou Barbeiro / Quero Iniciar
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 50L48 45.8333C96 41.6667 192 33.3333 288 35.4167C384 37.5 480 50 576 54.1667C672 58.3333 768 54.1667 864 45.8333C960 37.5 1056 25 1152 22.9167C1248 20.8333 1344 29.1667 1392 33.3333L1440 37.5V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Agendamento simples e rápido, do jeito que deveria ser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative text-center group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
                
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-burgundy flex items-center justify-center shadow-elegant group-hover:shadow-elegant-lg transition-shadow">
                    <step.icon className="h-10 w-10 text-cream" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-gold flex items-center justify-center font-bold text-charcoal text-sm shadow-md md:left-1/2 md:right-auto md:-translate-x-1/2">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Por que usar o <span className="text-primary">Bigode</span>?
                </h2>
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-burgundy/10 to-gold/10 rounded-3xl p-4 flex items-center justify-center overflow-hidden border border-white/5 shadow-2xl">
                   <img 
                      src="/bigode-mockup.png" 
                      alt="Bigode App Interface" 
                      className="w-full h-full object-contain rounded-2xl transform hover:scale-105 transition-transform duration-700"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Pronto para simplificar seus agendamentos?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Se você é dono de barbearia, comece agora mesmo a usar o Bigode. 
              Se você é cliente, peça para sua barbearia favorita entrar em contato.
            </p>
            <Link to="/admin/login">
              <Button variant="burgundy" size="xl">
                Começar Agora
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <MustacheLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2024 Bigode. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
