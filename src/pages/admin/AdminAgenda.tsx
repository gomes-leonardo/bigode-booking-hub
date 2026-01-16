import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, subDays, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  X,
  Phone,
  Clock,
  User,
  Scissors
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

interface Barber {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  barberId: string;
  barberName: string;
  serviceName: string;
  servicePrice: number;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Concluído", color: "bg-success/10 text-success border-success/20" },
  canceled: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20" },
  no_show: { label: "Não compareceu", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

const messages = {
  today: "Hoje",
  previous: "Anterior",
  next: "Próximo",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Nenhum agendamento neste período.",
  showMore: (total: number) => `+ ${total} mais`,
};

export default function AdminAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.WEEK);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedBarbers, setSelectedBarbers] = useState<Set<string>>(new Set());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersRes, appointmentsRes] = await Promise.all([
          api.get<{ barbers: Barber[] }>("/admin/barbers"),
          api.get<{ appointments: Appointment[] }>("/admin/agenda"),
        ]);
        
        setBarbers(barbersRes.barbers);
        setAppointments(appointmentsRes.appointments);
        setSelectedBarbers(new Set(barbersRes.barbers.map(b => b.id)));
      } catch (error) {
        console.error("Error fetching agenda data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const events: CalendarEvent[] = useMemo(() => {
    return appointments
      .filter(apt => selectedBarbers.has(apt.barberId))
      .map(apt => ({
        id: apt.id,
        title: `${apt.clientName} - ${apt.serviceName}`,
        start: new Date(apt.startTime),
        end: new Date(apt.endTime),
        resource: apt,
      }));
  }, [appointments, selectedBarbers]);

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'TODAY') {
      setCurrentDate(new Date());
    } else if (action === 'PREV') {
      if (view === Views.MONTH) {
        setCurrentDate(subMonths(currentDate, 1));
      } else if (view === Views.WEEK) {
        setCurrentDate(subDays(currentDate, 7));
      } else {
        setCurrentDate(subDays(currentDate, 1));
      }
    } else {
      if (view === Views.MONTH) {
        setCurrentDate(addMonths(currentDate, 1));
      } else if (view === Views.WEEK) {
        setCurrentDate(addDays(currentDate, 7));
      } else {
        setCurrentDate(addDays(currentDate, 1));
      }
    }
  };

  const getBarberColor = (barberId: string) => {
    const barber = barbers.find(b => b.id === barberId);
    return barber?.color || "#722F37";
  };

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const barberColor = getBarberColor(event.resource.barberId);
    const isCanceled = event.resource.status === 'canceled';
    
    return {
      style: {
        backgroundColor: isCanceled ? '#f3f4f6' : `${barberColor}15`,
        borderLeft: `4px solid ${barberColor}`,
        borderRadius: '8px',
        color: isCanceled ? '#9ca3af' : '#1a1a1a',
        textDecoration: isCanceled ? 'line-through' : 'none',
        padding: '4px 8px',
        fontSize: '13px',
        fontWeight: 500,
      },
    };
  }, [barbers]);

  const toggleBarber = (barberId: string) => {
    const newSelected = new Set(selectedBarbers);
    if (newSelected.has(barberId)) {
      newSelected.delete(barberId);
    } else {
      newSelected.add(barberId);
    }
    setSelectedBarbers(newSelected);
  };

  const formatDateHeader = () => {
    if (view === Views.MONTH) {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    } else if (view === Views.WEEK) {
      const start = startOfWeek(currentDate, { locale: ptBR });
      const end = addDays(start, 6);
      return `${format(start, "d MMM", { locale: ptBR })} - ${format(end, "d MMM yyyy", { locale: ptBR })}`;
    } else {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-[600px] bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto scrollbar-elegant hidden lg:flex">
        {/* Mini Calendar */}
        <Card className="card-elegant">
          <CardContent className="p-3">
            <MiniCalendar 
              currentDate={currentDate} 
              onDateSelect={(date) => {
                setCurrentDate(date);
                setView(Views.DAY);
              }}
            />
          </CardContent>
        </Card>

        {/* Barber Filter */}
        <Card className="card-elegant flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Barbeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {barbers.map((barber) => (
              <label
                key={barber.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedBarbers.has(barber.id)}
                  onCheckedChange={() => toggleBarber(barber.id)}
                />
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: barber.color }}
                />
                <span className="text-sm truncate">{barber.name}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleNavigate('PREV')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleNavigate('TODAY')}
            >
              Hoje
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleNavigate('NEXT')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <h2 className="font-display text-xl font-semibold capitalize ml-2">
              {formatDateHeader()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {[
                { key: Views.DAY, label: "Dia" },
                { key: Views.WEEK, label: "Semana" },
                { key: Views.MONTH, label: "Mês" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    view === v.key 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-muted"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <Button variant="burgundy" size="sm">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 p-4 overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events}
            date={currentDate}
            view={view}
            onNavigate={(date) => setCurrentDate(date)}
            onView={(v) => setView(v)}
            onSelectEvent={(event) => setSelectedAppointment(event.resource)}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            culture="pt-BR"
            min={new Date(2024, 0, 1, 6, 0)}
            max={new Date(2024, 0, 1, 22, 0)}
            step={30}
            timeslots={1}
            className="h-full bg-card rounded-xl p-4 shadow-elegant"
            toolbar={false}
          />
        </div>
      </div>

      {/* Appointment Detail Sidebar */}
      {selectedAppointment && (
        <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto scrollbar-elegant animate-slide-in-right">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Detalhes</h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedAppointment(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Client Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Cliente</span>
              </div>
              <p className="font-semibold text-lg">{selectedAppointment.clientName}</p>
              <a 
                href={`tel:${selectedAppointment.clientPhone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {selectedAppointment.clientPhone}
              </a>
            </div>

            {/* Service Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Scissors className="h-4 w-4" />
                <span className="text-sm">Serviço</span>
              </div>
              <p className="font-medium">{selectedAppointment.serviceName}</p>
              <p className="text-secondary font-semibold">
                {formatCurrency(selectedAppointment.servicePrice)}
              </p>
            </div>

            {/* Time Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Horário</span>
              </div>
              <p className="font-medium">
                {format(new Date(selectedAppointment.startTime), "HH:mm", { locale: ptBR })} - {format(new Date(selectedAppointment.endTime), "HH:mm", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedAppointment.startTime), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            {/* Barber Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Barbeiro</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getBarberColor(selectedAppointment.barberId) }}
                />
                <span className="font-medium">{selectedAppointment.barberName}</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge 
                variant="outline" 
                className={cn("w-fit", statusConfig[selectedAppointment.status].color)}
              >
                {statusConfig[selectedAppointment.status].label}
              </Badge>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-2">
              <Button variant="success" className="w-full" size="sm">
                Marcar como Concluído
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Remarcar
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                Cancelar Agendamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini Calendar Component
function MiniCalendar({ 
  currentDate, 
  onDateSelect 
}: { 
  currentDate: Date; 
  onDateSelect: (date: Date) => void;
}) {
  const [displayMonth, setDisplayMonth] = useState(currentDate);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(displayMonth);
    const end = endOfMonth(displayMonth);
    const days: Date[] = [];
    
    // Add padding days from previous month
    const startDay = getDay(start);
    for (let i = startDay; i > 0; i--) {
      days.push(subDays(start, i));
    }
    
    // Add days of current month
    let current = start;
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    
    // Add padding days for next month
    while (days.length < 42) {
      days.push(addDays(end, days.length - (end.getDate() + startDay) + 1));
    }
    
    return days;
  }, [displayMonth]);

  const isCurrentMonth = (date: Date) => {
    return format(date, "MM") === format(displayMonth, "MM");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}>
          <ChevronLeft className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
        <span className="text-sm font-medium capitalize">
          {format(displayMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}>
          <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
          <div key={i} className="text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
        {daysInMonth.map((date, i) => (
          <button
            key={i}
            onClick={() => onDateSelect(date)}
            className={cn(
              "w-7 h-7 rounded-full text-xs transition-colors",
              !isCurrentMonth(date) && "text-muted-foreground/40",
              isCurrentMonth(date) && "hover:bg-muted",
              isSameDay(date, new Date()) && "bg-primary text-primary-foreground",
              isSameDay(date, currentDate) && !isSameDay(date, new Date()) && "ring-2 ring-primary"
            )}
          >
            {format(date, "d")}
          </button>
        ))}
      </div>
    </div>
  );
}
