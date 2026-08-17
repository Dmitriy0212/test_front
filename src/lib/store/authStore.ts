import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/user";

type AuthStore = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearIsAuthenticated: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      clearIsAuthenticated: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
