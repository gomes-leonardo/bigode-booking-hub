import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { MustacheLogo } from "@/components/icons/MustacheLogo";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  Check,
  CalendarClock,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { format, addDays, startOfDay, isSameDay, isBefore, parse, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

type Step = "loading" | "barber" | "barber-detail" | "appointments-view" | "queue-join" | "queue-position" | "service" | "date" | "time" | "confirmation" | "success";

interface TokenValidationResponse {
  barbershopId: string;
  barberId: string | null;
  message: string;
}

interface Barber {
  id: string;
  name: string;
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Appointment {
  id: string;
  barberId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface AppointmentView {
  date: string;
  appointments: Array<{
    id: string;
    startTime: string;
    endTime: string;
    serviceName?: string;
    status: string;
  }>;
}

interface QueueStatus {
  isOpen: boolean;
  currentPosition?: number;
  estimatedWaitTime?: number;
  queueLength: number;
}

interface QueueJoinResponse {
  position: number;
  estimatedWaitTime: number;
  queueLength: number;
}

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function BookingFlow() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("loading");
  const [isLoading, setIsLoading] = useState(false);

  // Token validation data
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [preSelectedBarberId, setPreSelectedBarberId] = useState<string | null>(null);

  // Selection data
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Success data
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Queue data
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [queueWaitTime, setQueueWaitTime] = useState<number | null>(null);

  // Appointments view data
  const [barberAppointments, setBarberAppointments] = useState<AppointmentView[]>([]);

  // Step 1: Token Validation
  useEffect(() => {
    if (!token) {
      toast({
        title: "Token inválido",
        description: "O link de agendamento não é válido.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const validateToken = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<TokenValidationResponse>(`/auth/booking/${token}`);
        setBarbershopId(response.barbershopId);
        setPreSelectedBarberId(response.barberId);

        // Fetch barbers and services
        const [barbersRes, servicesRes] = await Promise.all([
          api.get<{ barbers: Barber[] }>(`/barbershops/${response.barbershopId}/barbers`),
          api.get<{ services: Service[] }>(`/barbershops/${response.barbershopId}/services`),
        ]);

        setBarbers(barbersRes.barbers);
        setServices(servicesRes.services);

        // If barber is pre-selected, skip barber selection
        if (response.barberId) {
          const preSelectedBarber = barbersRes.barbers.find((b) => b.id === response.barberId);
          if (preSelectedBarber) {
            setSelectedBarber(preSelectedBarber);
            // Load appointments and queue status for pre-selected barber
            loadBarberData(preSelectedBarber.id);
            setStep("barber-detail");
          } else {
            setStep("barber");
          }
        } else {
          setStep("barber");
        }
      } catch (error) {
        toast({
          title: "Erro ao validar link",
          description: error instanceof Error ? error.message : "O link pode estar expirado ou inválido.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  // Get available slots when date and barber are selected
  useEffect(() => {
    if (!selectedBarber || !selectedDate || step !== "time") return;

    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const response = await api.get<{ slots: TimeSlot[] }>(
          `/availability?barberId=${selectedBarber.id}&date=${dateStr}`
        );
        setAvailableSlots(response.slots);
      } catch (error) {
        toast({
          title: "Erro ao buscar horários",
          description: "Não foi possível carregar os horários disponíveis.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedBarber, selectedDate, step, toast]);

  const loadBarberData = async (barberId: string) => {
    setIsLoading(true);
    try {
      const [appointmentsRes, queueRes] = await Promise.all([
        api.get<{ appointments: AppointmentView[] }>(`/barbers/${barberId}/appointments`),
        api.get<QueueStatus>(`/barbers/${barberId}/queue`),
      ]);
      setBarberAppointments(appointmentsRes.appointments || []);
      setQueueStatus(queueRes);
    } catch (error) {
      console.error("Error loading barber data:", error);
      // Set default values if API fails
      setBarberAppointments([]);
      setQueueStatus({ isOpen: true, queueLength: 0, estimatedWaitTime: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarberSelect = async (barber: Barber) => {
    setSelectedBarber(barber);
    await loadBarberData(barber.id);
    setStep("barber-detail");
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("date");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setStep("time");
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setStep("confirmation");
  };

  const handleConfirmBooking = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTimeSlot) return;

    setIsLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTimeSlot.startTime.split(":").map(Number);
      const appointmentDateTime = setMinutes(setHours(selectedDate, hours), minutes);

      const response = await api.post<Appointment>("/appointments", {
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        startTime: appointmentDateTime.toISOString(),
      });

      setCreatedAppointment(response);
      setStep("success");
    } catch (error) {
      toast({
        title: "Erro ao criar agendamento",
        description: error instanceof Error ? error.message : "Não foi possível confirmar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseBooking = () => {
    setStep("appointments-view");
  };

  const handleChooseQueue = () => {
    setStep("queue-join");
  };

  const handleJoinQueue = async () => {
    if (!selectedBarber) return;

    setIsLoading(true);
    try {
      const response = await api.post<QueueJoinResponse>(`/barbers/${selectedBarber.id}/queue/join`, {});
      setQueuePosition(response.position);
      setQueueWaitTime(response.estimatedWaitTime);
      setStep("queue-position");
    } catch (error) {
      toast({
        title: "Erro ao entrar na fila",
        description: error instanceof Error ? error.message : "Não foi possível entrar na fila.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Polling for queue position
  useEffect(() => {
    if (step !== "queue-position" || !selectedBarber || queuePosition === null) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get<QueueJoinResponse>(`/barbers/${selectedBarber.id}/queue/position`);
        setQueuePosition(response.position);
        setQueueWaitTime(response.estimatedWaitTime);
        
        if (response.position <= 0) {
          clearInterval(interval);
          toast({
            title: "Sua vez chegou!",
            description: "Você está na frente da fila.",
          });
        }
      } catch (error) {
        console.error("Error polling queue position:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [step, selectedBarber, queuePosition, toast]);

  const handleLeaveQueue = async () => {
    if (!selectedBarber) return;

    setIsLoading(true);
    try {
      await api.delete(`/barbers/${selectedBarber.id}/queue/leave`);
      setQueuePosition(null);
      setQueueWaitTime(null);
      setStep("barber-detail");
      toast({
        title: "Você saiu da fila",
        description: "Você pode entrar novamente quando quiser.",
      });
    } catch (error) {
      toast({
        title: "Erro ao sair da fila",
        description: error instanceof Error ? error.message : "Não foi possível sair da fila.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkingDays = (barber: Barber) => {
    return barber.schedules
      .filter((s) => s.isActive)
      .map((s) => DAYS_OF_WEEK[s.dayOfWeek] || DAYS_OF_WEEK[0]);
  };

  const isDateDisabled = (date: Date) => {
    if (!selectedBarber) return true;
    if (isBefore(date, startOfDay(new Date()))) return true;

    const dayOfWeek = date.getDay();
    const schedule = selectedBarber.schedules.find((s) => s.dayOfWeek === dayOfWeek);
    return !schedule?.isActive;
  };

  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const generateCalendarLink = () => {
    if (!createdAppointment || !selectedBarber || !selectedService || !selectedDate || !selectedTimeSlot) return "";

    const [hours, minutes] = selectedTimeSlot.startTime.split(":").map(Number);
    const start = setMinutes(setHours(selectedDate, hours), minutes);
    const end = new Date(start.getTime() + selectedService.duration * 60000);

    const title = encodeURIComponent(`${selectedService.name} - ${selectedBarber.name}`);
    const details = encodeURIComponent(`Agendamento na Barbearia do Bigode`);
    const location = encodeURIComponent("Barbearia do Bigode");
    const startStr = start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endStr = end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  // Stepper component
  const Stepper = ({ currentStep }: { currentStep: Step }) => {
    const steps = [
      { id: "barber", label: "Barbeiro", icon: User },
      { id: "service", label: "Serviço", icon: Scissors },
      { id: "date", label: "Data", icon: CalendarIcon },
      { id: "time", label: "Horário", icon: Clock },
      { id: "confirmation", label: "Confirmar", icon: CheckCircle2 },
    ];

    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    const visibleSteps = preSelectedBarberId ? steps.slice(1) : steps;

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {visibleSteps.map((step, index) => {
          const stepNum = preSelectedBarberId ? index + 1 : index;
          const isActive = stepIndex >= stepNum;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary text-cream shadow-md"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < visibleSteps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 transition-all ${
                    isActive ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cream mx-auto mb-4" />
          <p className="text-cream/70">Validando link de agendamento...</p>
        </div>
      </div>
    );
  }

  if (step === "success" && createdAppointment) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
        {/* Confetti effect placeholder */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-secondary rounded-full animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <Card className="card-elegant max-w-md w-full animate-scale-in relative z-10">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center">
                <Check className="h-10 w-10 text-charcoal" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Agendamento Confirmado!
              </h1>
              <p className="text-muted-foreground">
                Seu horário foi reservado com sucesso.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Barbeiro</p>
                <p className="font-semibold">{selectedBarber?.name}</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Serviço</p>
                <p className="font-semibold">{selectedService?.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedService?.duration} minutos • {formatCurrency(selectedService?.price || 0)}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Data e Horário</p>
                <p className="font-semibold">
                  {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={generateCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full" size="lg">
                  <CalendarClock className="h-5 w-5" />
                  Adicionar ao Calendário
                </Button>
              </a>
              <Button
                variant="burgundy"
                className="w-full"
                size="lg"
                onClick={() => navigate("/")}
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MustacheLogo size="lg" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Agende seu Horário
          </h1>
          <p className="text-muted-foreground">Escolha o barbeiro, serviço, data e horário</p>
        </div>

        {/* Stepper */}
        <Stepper currentStep={step} />

        {/* Step Content */}
        <Card className="card-elegant animate-fade-in">
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Barber Selection */}
            {step === "barber" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Escolha seu Barbeiro
                  </h2>
                  <p className="text-muted-foreground">Selecione o profissional para seu atendimento</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbers.map((barber) => (
                    <button
                      key={barber.id}
                      onClick={() => handleBarberSelect(barber)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedBarber?.id === barber.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full gradient-burgundy flex items-center justify-center flex-shrink-0">
                          <User className="h-8 w-8 text-cream" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2">{barber.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {getWorkingDays(barber).map((day, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {day}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Barber Detail - Choose Booking or Queue */}
            {step === "barber-detail" && selectedBarber && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("barber")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {selectedBarber.name}
                    </h2>
                    <p className="text-muted-foreground">Escolha como deseja ser atendido</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Booking Option */}
                  <button
                    onClick={() => setStep("service")}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:shadow-md transition-all text-left bg-card"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg gradient-burgundy flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-6 w-6 text-cream" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Agendar Horário</h3>
                        <p className="text-sm text-muted-foreground">
                          Escolha uma data e horário disponível
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Queue Option */}
                  <button
                    onClick={handleChooseQueue}
                    className="p-6 rounded-xl border-2 border-border hover:border-secondary/50 hover:shadow-md transition-all text-left bg-card"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-charcoal" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Entrar na Fila</h3>
                        <p className="text-sm text-muted-foreground">
                          {queueStatus?.isOpen ? (
                            <>Aguarde sua vez • {queueStatus.queueLength} pessoas na fila</>
                          ) : (
                            <>Fila fechada no momento</>
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step: Appointments View - List by Date */}
            {step === "appointments-view" && selectedBarber && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("barber-detail")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Agendamentos de {selectedBarber.name}
                    </h2>
                    <p className="text-muted-foreground">Visualize os horários ocupados</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {barberAppointments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Nenhum agendamento encontrado.
                      </div>
                    ) : (
                      barberAppointments
                        .filter((aptView) => {
                          // Filter out past dates
                          const viewDate = new Date(aptView.date);
                          return viewDate >= startOfDay(new Date());
                        })
                        .map((aptView) => {
                          const viewDate = new Date(aptView.date);
                          return (
                            <div key={aptView.date} className="space-y-3">
                              <h3 className="font-semibold text-lg text-foreground">
                                {format(viewDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </h3>
                              <div className="space-y-2">
                                {aptView.appointments.map((apt) => {
                                  const startTime = new Date(apt.startTime);
                                  const endTime = new Date(apt.endTime);
                                  return (
                                    <div
                                      key={apt.id}
                                      className="p-4 bg-muted/50 rounded-lg border border-border"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <Clock className="h-5 w-5 text-muted-foreground" />
                                          <div>
                                            <p className="font-semibold text-foreground">
                                              {format(startTime, "HH:mm", { locale: ptBR })} -{" "}
                                              {format(endTime, "HH:mm", { locale: ptBR })}
                                            </p>
                                            {apt.serviceName && (
                                              <p className="text-sm text-muted-foreground">
                                                {apt.serviceName}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className={
                                            apt.status === "scheduled"
                                              ? "bg-blue-100 text-blue-700 border-blue-200"
                                              : ""
                                          }
                                        >
                                          {apt.status === "scheduled" ? "Agendado" : apt.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                    )}

                    <Button
                      variant="burgundy"
                      size="lg"
                      className="w-full mt-6"
                      onClick={() => setStep("service")}
                    >
                      Agendar Horário Agora
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step: Queue Join */}
            {step === "queue-join" && selectedBarber && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("barber-detail")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Entrar na Fila
                    </h2>
                    <p className="text-muted-foreground">Aguarde sua vez para ser atendido</p>
                  </div>
                </div>

                {queueStatus && (
                  <div className="p-6 bg-muted/50 rounded-lg border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pessoas na fila</span>
                      <span className="font-bold text-2xl text-foreground">
                        {queueStatus.queueLength}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tempo estimado</span>
                      <span className="font-semibold text-foreground">
                        {Math.floor(queueStatus.estimatedWaitTime! / 60)}h{" "}
                        {queueStatus.estimatedWaitTime! % 60}min
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  variant="gold"
                  size="xl"
                  className="w-full"
                  onClick={handleJoinQueue}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Entrando na fila...
                    </>
                  ) : (
                    <>
                      Entrar na Fila
                      <Users className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step: Queue Position */}
            {step === "queue-position" && selectedBarber && (
              <div className="space-y-6">
                {/* Live indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="relative">
                    <div className="w-3 h-3 bg-success rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-success rounded-full relative"></div>
                  </div>
                  <span className="text-sm font-medium text-success">Ao vivo</span>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    {/* Pulsing ring animation */}
                    <div className="absolute inset-0 rounded-full gradient-gold opacity-20 animate-ping"></div>
                    <div className="absolute inset-2 rounded-full gradient-gold opacity-40 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full gradient-gold flex items-center justify-center shadow-lg">
                      <span className="font-bold text-5xl text-charcoal relative z-10">
                        {queuePosition !== null ? queuePosition : "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Sua Posição na Fila
                    </h2>
                    <p className="text-muted-foreground">
                      {queuePosition === 1
                        ? "Você é o próximo!"
                        : queuePosition !== null
                        ? `Ainda ${queuePosition} ${queuePosition === 1 ? "pessoa" : "pessoas"} na frente`
                        : "Carregando..."}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border-2 border-border space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-5 w-5 animate-pulse text-primary" />
                      Tempo de espera estimado
                    </span>
                    <span className="font-bold text-2xl text-primary">
                      {queueWaitTime !== null
                        ? `${Math.floor(queueWaitTime / 60)}h ${String(queueWaitTime % 60).padStart(2, "0")}min`
                        : "-"}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Tempo aproximado: 40 minutos por corte
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">Atualizando...</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {queuePosition !== null && queuePosition > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progresso na fila</span>
                      <span>{queuePosition > 10 ? "10+" : queuePosition} pessoas</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-gold transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(10, 100 - queuePosition * 10)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                  onClick={handleLeaveQueue}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saindo da fila...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      Sair da Fila
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Service Selection */}
            {step === "service" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("barber")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Escolha o Serviço
                    </h2>
                    <p className="text-muted-foreground">Selecione o serviço desejado</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services && services.length > 0 ? (
                    services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedService?.id === service.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <span className="font-bold text-primary">{formatCurrency(service.price)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {service.duration} minutos
                      </p>
                    </button>
                  ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      Carregando serviços...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Date Selection */}
            {step === "date" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("service")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Escolha a Data
                    </h2>
                    <p className="text-muted-foreground">Selecione o dia para seu agendamento</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={handleDateSelect}
                    disabled={isDateDisabled}
                    fromDate={new Date()}
                    toDate={addDays(new Date(), 60)}
                    locale={ptBR}
                    className="rounded-lg border border-border p-3"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Time Slot Selection */}
            {step === "time" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("date")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Escolha o Horário
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const { morning, afternoon, evening } = groupSlotsByPeriod(availableSlots);
                      return (
                        <>
                          {morning.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-foreground mb-3">Manhã</h3>
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {morning.map((slot, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleTimeSelect(slot)}
                                    className={`p-3 rounded-lg border-2 transition-all font-mono text-sm ${
                                      selectedTimeSlot?.startTime === slot.startTime
                                        ? "border-primary bg-primary text-cream shadow-md"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    {slot.startTime}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {afternoon.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-foreground mb-3">Tarde</h3>
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {afternoon.map((slot, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleTimeSelect(slot)}
                                    className={`p-3 rounded-lg border-2 transition-all font-mono text-sm ${
                                      selectedTimeSlot?.startTime === slot.startTime
                                        ? "border-primary bg-primary text-cream shadow-md"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    {slot.startTime}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {evening.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-foreground mb-3">Noite</h3>
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {evening.map((slot, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleTimeSelect(slot)}
                                    className={`p-3 rounded-lg border-2 transition-all font-mono text-sm ${
                                      selectedTimeSlot?.startTime === slot.startTime
                                        ? "border-primary bg-primary text-cream shadow-md"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    {slot.startTime}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {availableSlots.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              Nenhum horário disponível nesta data.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === "confirmation" && selectedBarber && selectedService && selectedDate && selectedTimeSlot && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("time")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Confirmar Agendamento
                    </h2>
                    <p className="text-muted-foreground">Revise os detalhes antes de confirmar</p>
                  </div>
                </div>

                <div className="space-y-4 p-6 bg-muted/50 rounded-xl">
                  <div className="flex items-start gap-4">
                    <User className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Barbeiro</p>
                      <p className="font-semibold">{selectedBarber.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Scissors className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Serviço</p>
                      <p className="font-semibold">{selectedService.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedService.duration} minutos • {formatCurrency(selectedService.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data</p>
                      <p className="font-semibold">
                        {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Horário</p>
                      <p className="font-semibold">
                        {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">
                      {formatCurrency(selectedService.price)}
                    </span>
                  </div>

                  <Button
                    variant="burgundy"
                    size="xl"
                    className="w-full"
                    onClick={handleConfirmBooking}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        Confirmar Agendamento
                        <CheckCircle2 className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
