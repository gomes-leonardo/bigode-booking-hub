import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Link2, 
  Copy, 
  Check,
  MessageCircle,
  QrCode,
  Clock,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

interface Barber {
  id: string;
  name: string;
}

interface BookingLinkResponse {
  bookingUrl: string;
  expiresAt: string;
}

export default function AdminBookingLink() {
  const { admin } = useAuthStore();
  const { toast } = useToast();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [phone, setPhone] = useState("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingLink, setBookingLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await api.get<{ barbers: Barber[] }>("/admin/barbers");
        setBarbers(response.barbers);
      } catch (error) {
        console.error("Error fetching barbers:", error);
      }
    };

    fetchBarbers();
  }, []);

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

  const handleGenerateLink = async () => {
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
      const response = await api.post<BookingLinkResponse>("/auth/booking-link", {
        barbershopId: admin?.barbershopId,
        barberId: selectedBarber || undefined,
        customerPhone: `+55${phoneNumbers}`,
      });
      
      setBookingLink(response.bookingUrl);
      setExpiresAt(new Date(response.expiresAt));
      
      toast({
        title: "Link gerado!",
        description: "O link de agendamento foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar link",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!bookingLink) return;
    
    try {
      await navigator.clipboard.writeText(bookingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleSendWhatsApp = () => {
    const phoneNumbers = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá! Aqui está seu link de agendamento para a ${admin?.barbershopName}:\n\n${bookingLink}\n\nEste link é válido por 15 minutos.`
    );
    window.open(`https://wa.me/55${phoneNumbers}?text=${message}`, "_blank");
  };

  const formatTimeRemaining = () => {
    if (!expiresAt) return "";
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return "Expirado";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Gerar Link de Agendamento</h1>
        <p className="text-muted-foreground">Crie um link exclusivo para enviar ao cliente via WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Criar Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp do Cliente *</Label>
              <Input
                id="phone"
                variant="elegant"
                inputSize="lg"
                type="tel"
                placeholder="(11) 99999-0000"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={16}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barber">Barbeiro (opcional)</Label>
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Cliente escolhe o barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Cliente escolhe</SelectItem>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se não selecionar, o cliente poderá escolher o barbeiro.
              </p>
            </div>

            <Button
              variant="burgundy"
              size="lg"
              className="w-full"
              onClick={handleGenerateLink}
              disabled={isLoading || phone.replace(/\D/g, "").length !== 11}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Link2 className="h-5 w-5" />
                  Gerar Link
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {bookingLink && (
          <Card className="card-elegant animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Link Gerado</span>
                <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatTimeRemaining()}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Link Display */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Link de Agendamento:</p>
                <p className="font-mono text-sm break-all text-foreground">{bookingLink}</p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
                <Button
                  variant="success"
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar via WhatsApp
                </Button>
              </div>

              {/* QR Code Placeholder */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  QR Code disponível em breve
                </p>
              </div>

              {/* New Link Button */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setBookingLink(null);
                  setPhone("");
                  setSelectedBarber("");
                }}
              >
                Gerar Novo Link
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
