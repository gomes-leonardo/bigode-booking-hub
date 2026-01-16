import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  Calendar,
  Users,
  Scissors,
  Link2,
  Clock,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalAppointments: number;
  completed: number;
  canceled: number;
  noShow: number;
  totalRevenue: number;
  appointmentsByDay: { day: string; count: number }[];
  revenueByWeek: { week: string; revenue: number }[];
  appointmentsByBarber: { name: string; count: number; color: string }[];
}

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  barberName: string;
  serviceName: string;
  servicePrice: number;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
}

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Concluído", color: "bg-success/10 text-success border-success/20" },
  canceled: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20" },
  no_show: { label: "Não compareceu", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

export default function AdminDashboard() {
  const { admin } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appointmentsRes] = await Promise.all([
          api.get<DashboardStats>("/admin/dashboard"),
          api.get<{ appointments: Appointment[] }>("/admin/agenda"),
        ]);
        setStats(statsRes);
        setAppointments(appointmentsRes.appointments.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Olá, {admin?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">{admin?.barbershopName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Hoje
          </Button>
          <Button variant="ghost" size="sm">
            Esta Semana
          </Button>
          <Button variant="ghost" size="sm">
            Este Mês
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-elegant animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalAppointments}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-3xl font-bold mt-1 text-success">{stats?.completed}</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-3xl font-bold mt-1 text-destructive">{stats?.canceled}</p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-3xl font-bold mt-1 text-secondary">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Day */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Agendamentos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.appointmentsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Week */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Receita por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.revenueByWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--gold))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--gold))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="card-elegant lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Agendamentos de Hoje</CardTitle>
            <Link to="/admin/agenda">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum agendamento para hoje
                </p>
              ) : (
                appointments.map((apt) => (
                  <div 
                    key={apt.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium">
                        {formatTime(apt.startTime)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{apt.clientName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {apt.serviceName} • {apt.barberName}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={statusConfig[apt.status].color}
                    >
                      {statusConfig[apt.status].label}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions + Pie Chart */}
        <div className="space-y-6">
          {/* Appointments by Barber */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Por Barbeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={stats?.appointmentsByBarber}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {stats?.appointmentsByBarber.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {stats?.appointmentsByBarber.map((barber) => (
                  <div key={barber.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: barber.color }} />
                    <span>{barber.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link to="/admin/booking-link">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Link2 className="h-4 w-4" />
                  Gerar Link
                </Button>
              </Link>
              <Link to="/admin/agenda">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4" />
                  Ver Agenda
                </Button>
              </Link>
              <Link to="/admin/barbers">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4" />
                  Barbeiros
                </Button>
              </Link>
              <Link to="/admin/services">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Scissors className="h-4 w-4" />
                  Serviços
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
