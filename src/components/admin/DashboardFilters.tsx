import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, Users, X } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export type DateRangePreset = "today" | "week" | "month" | "custom";
export type AppointmentStatus = "all" | "scheduled" | "completed" | "canceled" | "no_show";

interface DashboardFiltersProps {
  onDateRangeChange: (range: { start: Date; end: Date; preset: DateRangePreset }) => void;
  onStatusChange: (status: AppointmentStatus) => void;
  onBarberChange: (barberId: string | null) => void;
  barbers: { id: string; name: string }[];
  selectedStatus: AppointmentStatus;
  selectedBarber: string | null;
  selectedPreset: DateRangePreset;
}

export function DashboardFilters({
  onDateRangeChange,
  onStatusChange,
  onBarberChange,
  barbers,
  selectedStatus,
  selectedBarber,
  selectedPreset,
}: DashboardFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handlePresetClick = (preset: DateRangePreset) => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case "today":
        start = today;
        end = today;
        break;
      case "week":
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case "month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      default:
        start = today;
        end = today;
    }

    onDateRangeChange({ start, end, preset });
  };

  const statusOptions = [
    { value: "all", label: "Todos os status" },
    { value: "scheduled", label: "Agendados" },
    { value: "completed", label: "Concluídos" },
    { value: "canceled", label: "Cancelados" },
    { value: "no_show", label: "Não compareceu" },
  ];

  const activeFiltersCount = 
    (selectedStatus !== "all" ? 1 : 0) + 
    (selectedBarber ? 1 : 0);

  return (
    <Card className="card-elegant">
      <CardContent className="p-4">
        {/* Main filter row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date range presets */}
          <div className="flex gap-2 flex-1">
            <Button
              variant={selectedPreset === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick("today")}
              className="flex-1 sm:flex-none"
            >
              Hoje
            </Button>
            <Button
              variant={selectedPreset === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick("week")}
              className="flex-1 sm:flex-none"
            >
              Esta Semana
            </Button>
            <Button
              variant={selectedPreset === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick("month")}
              className="flex-1 sm:flex-none"
            >
              Este Mês
            </Button>
          </div>

          {/* Toggle advanced filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-border animate-fade-in">
            {/* Status filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => onStatusChange(value as AppointmentStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barber filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Barbeiro
              </label>
              <Select
                value={selectedBarber || "all"}
                onValueChange={(value) => onBarberChange(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os barbeiros</SelectItem>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onStatusChange("all");
                    onBarberChange(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
