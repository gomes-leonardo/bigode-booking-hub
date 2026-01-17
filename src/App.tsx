import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import BookingFlow from "./pages/BookingFlow";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAgenda from "./pages/admin/AdminAgenda";
import AdminBarbers from "./pages/admin/AdminBarbers";
import AdminServices from "./pages/admin/AdminServices";
import AdminBookingLink from "./pages/admin/AdminBookingLink";
import { AdminLayout } from "./components/layout/AdminLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/booking/:token" element={<BookingFlow />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="agenda" element={<AdminAgenda />} />
            <Route path="barbers" element={<AdminBarbers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="booking-link" element={<AdminBookingLink />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
