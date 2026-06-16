import { create } from "zustand";
import type { AuthUser } from "@/types/api";

const TOKEN_KEY = "florita_token";
const USER_KEY = "florita_user";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Chamado após signup ou signin bem-sucedido
  login: (user: AuthUser) => void;

  // Limpa tudo e redireciona para login
  logout: () => void;

  // Reidrata o estado a partir do localStorage (chamado no layout raiz)
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user) => {
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, isAuthenticated: false });
  },

  hydrate: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const raw = localStorage.getItem(USER_KEY);

      if (!token || !raw) return;

      const user: AuthUser = JSON.parse(raw);
      set({ user, isAuthenticated: true });
    } catch {
      // localStorage corrompido: limpa silenciosamente
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
}));
