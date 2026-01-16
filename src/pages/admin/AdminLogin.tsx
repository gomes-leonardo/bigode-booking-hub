import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MustacheLogo } from "@/components/icons/MustacheLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt: string;
  devCode?: string;
}

interface VerifyResponse {
  admin: {
    id: string;
    name: string;
    phone: string;
    barbershopId: string;
    barbershopName: string;
    role: 'owner' | 'manager' | 'barber';
  };
  token: string;
  expiresAt: string;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleRequestOTP = async () => {
    const phoneNumbers = phone.replace(/\D/g, "");
    if (phoneNumbers.length !== 11) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um número válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<OTPResponse>("/admin/auth/request-otp", {
        phone: `+55${phoneNumbers}`,
      });
      
      setStep("otp");
      setCountdown(300); // 5 minutes
      if (response.devCode) {
        setDevCode(response.devCode);
      }
      
      toast({
        title: "Código enviado!",
        description: "Verifique seu WhatsApp para o código de verificação.",
      });
      
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      toast({
        title: "Erro ao enviar código",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(d => d) && value) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (code: string) => {
    const phoneNumbers = phone.replace(/\D/g, "");
    
    setIsLoading(true);
    try {
      const response = await api.post<VerifyResponse>("/admin/auth/verify-otp", {
        phone: `+55${phoneNumbers}`,
        code,
      });
      
      login(response.admin, response.token);
      
      toast({
        title: `Bem-vindo, ${response.admin.name}!`,
        description: "Login realizado com sucesso.",
      });
      
      navigate("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Código inválido",
        description: "Verifique o código e tente novamente.",
        variant: "destructive",
      });
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    handleRequestOTP();
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-elegant-lg p-8 animate-scale-in">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <MustacheLogo size="lg" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {step === "phone" ? "Acesso Administrativo" : "Verificação"}
            </h1>
            <p className="text-muted-foreground">
              {step === "phone" 
                ? "Entre com seu número de WhatsApp para receber o código de acesso."
                : "Digite o código de 6 dígitos enviado para seu WhatsApp."
              }
            </p>
          </div>

          {step === "phone" ? (
            /* Phone Step */
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    variant="elegant"
                    inputSize="lg"
                    type="tel"
                    placeholder="(11) 99999-0001"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="pl-10"
                    maxLength={16}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use: (11) 99999-0001 ou (11) 99999-0002 para teste
                </p>
              </div>

              <Button
                variant="burgundy"
                size="xl"
                className="w-full"
                onClick={handleRequestOTP}
                disabled={isLoading || phone.replace(/\D/g, "").length !== 11}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Enviar código
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* OTP Step */
            <div className="space-y-6">
              {/* Dev code hint */}
              {devCode && (
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-center">
                  <p className="text-sm text-gold-dark">
                    Código de desenvolvimento: <strong className="font-mono">{devCode}</strong>
                  </p>
                </div>
              )}

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-background border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Countdown */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Reenviar código em <span className="font-mono font-medium text-foreground">{formatCountdown(countdown)}</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-sm text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Reenviar código
                  </button>
                )}
              </div>

              {/* Back button */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setDevCode(null);
                }}
                disabled={isLoading}
              >
                Voltar
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-cream/50 text-sm mt-6">
          © 2024 Bigode. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
