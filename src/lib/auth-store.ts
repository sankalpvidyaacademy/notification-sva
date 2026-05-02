import { create } from 'zustand';

export interface User {
  id: string;
  userId: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  classes: string[];
  subjects: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
