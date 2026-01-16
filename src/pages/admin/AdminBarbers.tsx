import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit2, 
  Phone,
  Calendar
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Barber {
  id: string;
  name: string;
  phone: string;
  avatar: string | null;
  color: string;
  isActive: boolean;
  schedules: Schedule[];
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await api.get<{ barbers: Barber[] }>("/admin/barbers");
        setBarbers(response.barbers);
      } catch (error) {
        console.error("Error fetching barbers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  const getWorkingDays = (schedules: Schedule[]) => {
    return schedules
      .filter(s => s.isActive)
      .map(s => dayNames[s.dayOfWeek])
      .join(", ");
  };

  const getWorkingHours = (schedules: Schedule[]) => {
    const activeSchedules = schedules.filter(s => s.isActive);
    if (activeSchedules.length === 0) return "Sem horários";
    
    const firstSchedule = activeSchedules[0];
    return `${firstSchedule.startTime} - ${firstSchedule.endTime}`;
  };

  const toggleBarberActive = (barberId: string) => {
    setBarbers(prev => 
      prev.map(b => 
        b.id === barberId ? { ...b, isActive: !b.isActive } : b
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Barbeiros</h1>
          <p className="text-muted-foreground">Gerencie sua equipe de barbeiros</p>
        </div>
        <Button variant="burgundy">
          <Plus className="h-4 w-4" />
          Adicionar Barbeiro
        </Button>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <Card key={barber.id} className="card-elegant animate-fade-in overflow-hidden">
            <div 
              className="h-2" 
              style={{ backgroundColor: barber.color }} 
            />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-cream"
                    style={{ backgroundColor: barber.color }}
                  >
                    {barber.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{barber.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {barber.phone}
                    </div>
                  </div>
                </div>
                <Switch 
                  checked={barber.isActive}
                  onCheckedChange={() => toggleBarberActive(barber.id)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getWorkingDays(barber.schedules)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {barber.schedules
                    .filter(s => s.isActive)
                    .map((schedule) => (
                      <Badge 
                        key={schedule.dayOfWeek} 
                        variant="outline"
                        className="text-xs"
                      >
                        {dayNames[schedule.dayOfWeek]}: {schedule.startTime}-{schedule.endTime}
                      </Badge>
                    ))
                  }
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
