import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  ClipboardList,
  Link2,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MustacheLogo } from "@/components/icons/MustacheLogo";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/agenda", icon: Calendar, label: "Agenda" },
  { to: "/admin/appointments", icon: ClipboardList, label: "Agendamentos" },
  { to: "/admin/barbers", icon: Users, label: "Barbeiros" },
  { to: "/admin/services", icon: Scissors, label: "Serviços" },
  { to: "/admin/booking-link", icon: Link2, label: "Gerar Link" },
  { to: "/admin/subscription", icon: CreditCard, label: "Planos" },
  { to: "/admin/settings", icon: Settings, label: "Configurações" },
];

export function AdminSidebar() {
  const location = useLocation();
  const { admin, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "p-4 border-b border-sidebar-border flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <MustacheLogo size="sm" showText />}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-elegant">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && admin && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground">{admin.name}</p>
            <p className="text-xs text-sidebar-foreground/50">{admin.barbershopName}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={logout}
          className={cn(
            "text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
            !collapsed && "w-full justify-start"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
