const API_BASE_URL = 'http://localhost:3333';

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Get token from localStorage (zustand persists there)
    const authData = localStorage.getItem('bigode-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.state?.token) {
          headers['Authorization'] = `Bearer ${parsed.state.token}`;
        }
      } catch (e) {
        console.error('Error parsing auth data:', e);
      }
    }
    
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // For development, return mock data
      console.warn(`API call to ${endpoint} failed, using mock data:`, error);
      return this.getMockData(endpoint, options) as T;
    }
  }

  // Mock data for development
  private getMockData(endpoint: string, options: RequestInit): unknown {
    // Admin Auth
    if (endpoint.includes('/admin/auth/request-otp')) {
      return { success: true, message: 'Código enviado!', expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), devCode: '123456' };
    }
    
    if (endpoint.includes('/admin/auth/verify-otp')) {
      return {
        admin: {
          id: '550e8400-e29b-41d4-a716-446655440100',
          name: 'Carlos Silva',
          phone: '+5511999990001',
          barbershopId: '550e8400-e29b-41d4-a716-446655440200',
          barbershopName: 'Barbearia do Bigode',
          role: 'owner',
        },
        token: 'mock-jwt-token-12345',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    // Admin Dashboard stats
    if (endpoint.includes('/admin/dashboard') || endpoint.includes('/admin/stats')) {
      return {
        totalAppointments: 156,
        completed: 142,
        canceled: 8,
        noShow: 6,
        totalRevenue: 12450.00,
        appointmentsByDay: [
          { day: 'Seg', count: 24 },
          { day: 'Ter', count: 18 },
          { day: 'Qua', count: 32 },
          { day: 'Qui', count: 28 },
          { day: 'Sex', count: 35 },
          { day: 'Sáb', count: 19 },
        ],
        revenueByWeek: [
          { week: 'Sem 1', revenue: 2800 },
          { week: 'Sem 2', revenue: 3200 },
          { week: 'Sem 3', revenue: 2950 },
          { week: 'Sem 4', revenue: 3500 },
        ],
        appointmentsByBarber: [
          { name: 'Carlos', count: 52, color: '#722F37' },
          { name: 'Rafael', count: 48, color: '#D4AF37' },
          { name: 'Fernando', count: 56, color: '#2D5A3D' },
        ],
      };
    }

    // Barbers
    if (endpoint.includes('/barbers')) {
      return {
        barbers: [
          {
            id: '550e8400-e29b-41d4-a716-446655440201',
            name: 'Carlos Silva',
            phone: '+5511999990001',
            avatar: null,
            color: '#722F37',
            isActive: true,
            schedules: [
              { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },
            ],
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440202',
            name: 'Rafael Santos',
            phone: '+5511999990003',
            avatar: null,
            color: '#D4AF37',
            isActive: true,
            schedules: [
              { dayOfWeek: 1, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 2, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 3, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 4, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 5, startTime: '10:00', endTime: '19:00', isActive: true },
            ],
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440203',
            name: 'Fernando Oliveira',
            phone: '+5511999990004',
            avatar: null,
            color: '#2D5A3D',
            isActive: true,
            schedules: [
              { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 6, startTime: '08:00', endTime: '15:00', isActive: true },
            ],
          },
        ],
      };
    }

    // Services
    if (endpoint.includes('/services')) {
      // Support both /admin/services and /barbershops/:id/services
      return {
        services: [
          { id: '550e8400-e29b-41d4-a716-446655440210', name: 'Corte Masculino', duration: 30, price: 45.00 },
          { id: '550e8400-e29b-41d4-a716-446655440211', name: 'Barba Completa', duration: 30, price: 35.00 },
          { id: '550e8400-e29b-41d4-a716-446655440212', name: 'Combo Corte + Barba', duration: 60, price: 70.00 },
          { id: '550e8400-e29b-41d4-a716-446655440213', name: 'Corte Infantil', duration: 25, price: 35.00 },
          { id: '550e8400-e29b-41d4-a716-446655440214', name: 'Sobrancelha', duration: 15, price: 15.00 },
        ],
      };
    }

    // Appointments/Agenda
    if (endpoint.includes('/agenda') || endpoint.includes('/appointments')) {
      const today = new Date();
      return {
        appointments: [
          {
            id: '1',
            clientName: 'João Mendes',
            clientPhone: '+5511999991001',
            barberId: '550e8400-e29b-41d4-a716-446655440201',
            barberName: 'Carlos Silva',
            serviceId: '550e8400-e29b-41d4-a716-446655440210',
            serviceName: 'Corte Masculino',
            servicePrice: 45.00,
            startTime: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
            endTime: new Date(today.setHours(9, 30, 0, 0)).toISOString(),
            status: 'scheduled',
          },
          {
            id: '2',
            clientName: 'Pedro Alves',
            clientPhone: '+5511999991002',
            barberId: '550e8400-e29b-41d4-a716-446655440202',
            barberName: 'Rafael Santos',
            serviceId: '550e8400-e29b-41d4-a716-446655440212',
            serviceName: 'Combo Corte + Barba',
            servicePrice: 70.00,
            startTime: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
            endTime: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
            status: 'scheduled',
          },
          {
            id: '3',
            clientName: 'Lucas Ferreira',
            clientPhone: '+5511999991003',
            barberId: '550e8400-e29b-41d4-a716-446655440201',
            barberName: 'Carlos Silva',
            serviceId: '550e8400-e29b-41d4-a716-446655440211',
            serviceName: 'Barba Completa',
            servicePrice: 35.00,
            startTime: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
            endTime: new Date(today.setHours(11, 30, 0, 0)).toISOString(),
            status: 'completed',
          },
          {
            id: '4',
            clientName: 'Marcos Silva',
            clientPhone: '+5511999991004',
            barberId: '550e8400-e29b-41d4-a716-446655440203',
            barberName: 'Fernando Oliveira',
            serviceId: '550e8400-e29b-41d4-a716-446655440210',
            serviceName: 'Corte Masculino',
            servicePrice: 45.00,
            startTime: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
            endTime: new Date(today.setHours(14, 30, 0, 0)).toISOString(),
            status: 'scheduled',
          },
          {
            id: '5',
            clientName: 'André Costa',
            clientPhone: '+5511999991005',
            barberId: '550e8400-e29b-41d4-a716-446655440202',
            barberName: 'Rafael Santos',
            serviceId: '550e8400-e29b-41d4-a716-446655440210',
            serviceName: 'Corte Masculino',
            servicePrice: 45.00,
            startTime: new Date(today.setHours(15, 30, 0, 0)).toISOString(),
            endTime: new Date(today.setHours(16, 0, 0, 0)).toISOString(),
            status: 'canceled',
          },
        ],
      };
    }

    // Availability
    if (endpoint.includes('/availability')) {
      return {
        slots: [
          { startTime: '09:00', endTime: '09:30' },
          { startTime: '09:30', endTime: '10:00' },
          { startTime: '10:30', endTime: '11:00' },
          { startTime: '11:00', endTime: '11:30' },
          { startTime: '14:00', endTime: '14:30' },
          { startTime: '14:30', endTime: '15:00' },
          { startTime: '15:00', endTime: '15:30' },
          { startTime: '16:00', endTime: '16:30' },
          { startTime: '16:30', endTime: '17:00' },
        ],
      };
    }

    // Booking link
    if (endpoint.includes('/auth/booking-link')) {
      return {
        bookingUrl: 'https://bigode.app/booking/abc123xyz',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    }

    // Booking token validation
    if (endpoint.includes('/auth/booking/')) {
      return {
        barbershopId: '550e8400-e29b-41d4-a716-446655440200',
        barberId: null, // null = cliente escolhe, ou um ID específico para pre-selecionar
        message: 'Bem-vindo! Escolha seu barbeiro e horário.',
      };
    }

    // Queue endpoints
    if (endpoint.includes('/queue') && endpoint.includes('/join')) {
      return {
        position: 3,
        estimatedWaitTime: 120, // 40min × 3
        queueLength: 4,
      };
    }

    if (endpoint.includes('/queue') && endpoint.includes('/position')) {
      // Simulate position decreasing over time
      const position = Math.max(1, Math.floor(Math.random() * 5) + 1);
      return {
        position,
        estimatedWaitTime: position * 40,
        queueLength: position + 2,
      };
    }

    if (endpoint.includes('/queue') && options.method === 'DELETE') {
      return { success: true, message: 'Você saiu da fila' };
    }

    if (endpoint.includes('/queue') && !endpoint.includes('/join') && !endpoint.includes('/position') && !endpoint.includes('/leave')) {
      // GET /barbers/:id/queue - Status da fila
      return {
        isOpen: true,
        queueLength: 4,
        estimatedWaitTime: 120,
      };
    }

    // Get barber appointments
    if (endpoint.includes('/barbers/') && endpoint.includes('/appointments')) {
      const today = new Date();
      const appointments = [];
      
      // Generate appointments for next 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const appointmentsForDay = [];
        
        // 3-5 appointments per day
        const count = Math.floor(Math.random() * 3) + 3;
        for (let j = 0; j < count; j++) {
          const hour = 9 + j * 2;
          const start = new Date(date);
          start.setHours(hour, 0, 0, 0);
          const end = new Date(start);
          end.setMinutes(30);
          
          appointmentsForDay.push({
            id: `apt-${i}-${j}`,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            serviceName: ['Corte Masculino', 'Barba Completa', 'Combo'][j % 3],
            status: 'scheduled',
          });
        }
        
        if (appointmentsForDay.length > 0) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          appointments.push({
            date: `${year}-${month}-${day}`,
            appointments: appointmentsForDay,
          });
        }
      }
      
      return { appointments };
    }

    // Get barbershops barbers (for client booking flow)
    if (endpoint.includes('/barbershops/') && endpoint.includes('/barbers')) {
      return {
        barbers: [
          {
            id: '550e8400-e29b-41d4-a716-446655440201',
            name: 'Carlos Silva',
            schedules: [
              { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
              { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },
            ],
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440202',
            name: 'Rafael Santos',
            schedules: [
              { dayOfWeek: 1, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 2, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 3, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 4, startTime: '10:00', endTime: '19:00', isActive: true },
              { dayOfWeek: 5, startTime: '10:00', endTime: '19:00', isActive: true },
            ],
          },
        ],
      };
    }

    // Create appointment (client side)
    if (endpoint.includes('/appointments') && options.method === 'POST') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const now = new Date();
      const startTime = body.startTime ? new Date(body.startTime) : new Date(now.setHours(now.getHours() + 1));
      const service = body.serviceId === '550e8400-e29b-41d4-a716-446655440212' ? 60 : 30;
      const endTime = new Date(startTime.getTime() + service * 60000);
      
      return {
        id: '550e8400-e29b-41d4-a716-446655440300',
        barberId: body.barberId,
        serviceId: body.serviceId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'scheduled',
      };
    }

    return { success: true };
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
