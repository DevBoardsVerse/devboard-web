import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  hydrated: boolean;
  setAuth: (token: string, user: User) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  hydrated: false,
  setAuth: (token, user) => set({ accessToken: token, user, hydrated: true }),
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  logout: () => set({ accessToken: null, user: null }),
  setHydrated: () => set({ hydrated: true }),
}));