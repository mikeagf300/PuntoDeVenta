import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: null | { username: string; role: string; nombre?: string };
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

function getInitialAuth() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("pdv_user");
    if (user) return { isAuthenticated: true, user: JSON.parse(user) };
  }
  return { isAuthenticated: false, user: null };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialAuth(),
  login: async (username: string, password: string) => {
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      const user = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("pdv_user", JSON.stringify(user));
      }
      set({ isAuthenticated: true, user });
      return true;
    } catch {
      return false;
    }
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pdv_user");
    }
    set({ isAuthenticated: false, user: null });
  },
}));
