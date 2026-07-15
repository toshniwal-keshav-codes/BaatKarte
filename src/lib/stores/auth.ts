import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicUser } from "@/lib/api/auth";

interface AuthState {
  user: PublicUser | null;
  accessToken: string | null;
  hydrated: boolean;
  setSession: (s: { user: PublicUser; accessToken: string }) => void;
  setUser: (u: PublicUser) => void;
  clear: () => void;
  setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      setSession: ({ user, accessToken }) => set({ user, accessToken }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, accessToken: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "baatkarte.auth",
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);