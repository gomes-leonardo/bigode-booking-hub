import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
  id: string;
  name: string;
  email?: string;
  phone: string;
  barbershopId: string;
  barbershopName: string;
  role: 'owner' | 'manager' | 'barber';
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  hasSelectedPlan: boolean;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
  setHasSelectedPlan: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      hasSelectedPlan: false,
      login: (admin, token) => set({ admin, token, isAuthenticated: true }),
      logout: () => set({ admin: null, token: null, isAuthenticated: false, hasSelectedPlan: false }),
      setHasSelectedPlan: (value) => set({ hasSelectedPlan: value }),
    }),
    {
      name: 'bigode-auth',
    }
  )
);
