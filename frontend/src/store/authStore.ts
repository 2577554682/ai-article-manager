import { create } from "zustand";
import type { UserResponse } from "../types";

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  initialized: false,
  isAuthenticated: false,

  login: (token, username) => {
    const user = { id: 0, username, email: "", create_time: "" };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: () => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as UserResponse;
        set({ user, token, initialized: true, isAuthenticated: true });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ initialized: true, isAuthenticated: false });
      }
    } else {
      set({ initialized: true, isAuthenticated: false });
    }
  },
}));
