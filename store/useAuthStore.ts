import { create } from 'zustand';

interface AuthState {
  user: any | null;
  role: 'admin' | 'user' | null;
  setUser: (user: any | null) => void;
  setRole: (role: 'admin' | 'user' | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  logout: () => set({ user: null, role: null }),
}));