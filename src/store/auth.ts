import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setToken } from "@/lib/api";

export type Profile = {
  id: string;
  fullName: string;
  dob: string | null;
  gender: string | null;
  relationship: string | null;
  bloodType: string | null;
};

export type User = {
  id: string;
  email: string;
  locale: string;
  profiles: Profile[];
};

type AuthState = {
  user: User | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const USER_KEY = "hg.user";

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as User;
        set({ user: cached });
        // verify token still valid in background
        try {
          const fresh = await api<User>("/api/v1/me");
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
          set({ user: fresh });
        } catch {
          await setToken(null);
          await AsyncStorage.removeItem(USER_KEY);
          set({ user: null });
        }
      }
    } finally {
      set({ isHydrated: true });
    }
  },

  login: async (email, password) => {
    const res = await api<{ token: string; user: Omit<User, "profiles"> }>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    await setToken(res.token);
    const me = await api<User>("/api/v1/me");
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    set({ user: me });
  },

  register: async (email, password, fullName) => {
    const res = await api<{ token: string; user: Omit<User, "profiles">; profiles: Profile[] }>(
      "/api/v1/auth/register",
      { method: "POST", body: JSON.stringify({ email, password, fullName }) }
    );
    await setToken(res.token);
    const me = await api<User>("/api/v1/me");
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    set({ user: me });
  },

  logout: async () => {
    await setToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    set({ user: null });
  },

  refreshUser: async () => {
    const me = await api<User>("/api/v1/me");
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    set({ user: me });
  },
}));
