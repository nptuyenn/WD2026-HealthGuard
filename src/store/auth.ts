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
  activeProfileId: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setActiveProfile: (id: string) => Promise<void>;
};

const USER_KEY = "hg.user";
const ACTIVE_PROFILE_KEY = "hg.activeProfile";

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  activeProfileId: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as User;
        const savedId = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
        const validId = cached.profiles.find((p) => p.id === savedId)?.id ?? cached.profiles[0]?.id ?? null;
        set({ user: cached, activeProfileId: validId });
        try {
          const fresh = await api<User>("/api/v1/me");
          const freshId = fresh.profiles.find((p) => p.id === validId)?.id ?? fresh.profiles[0]?.id ?? null;
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
          set({ user: fresh, activeProfileId: freshId });
        } catch {
          await setToken(null);
          await AsyncStorage.removeItem(USER_KEY);
          await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
          set({ user: null, activeProfileId: null });
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
    const defaultId = me.profiles[0]?.id ?? null;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    if (defaultId) await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, defaultId);
    set({ user: me, activeProfileId: defaultId });
  },

  register: async (email, password, fullName) => {
    const res = await api<{ token: string; user: Omit<User, "profiles">; profiles: Profile[] }>(
      "/api/v1/auth/register",
      { method: "POST", body: JSON.stringify({ email, password, fullName }) }
    );
    await setToken(res.token);
    const me = await api<User>("/api/v1/me");
    const defaultId = me.profiles[0]?.id ?? null;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    if (defaultId) await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, defaultId);
    set({ user: me, activeProfileId: defaultId });
  },

  logout: async () => {
    await setToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
    set({ user: null, activeProfileId: null });
  },

  refreshUser: async () => {
    const me = await api<User>("/api/v1/me");
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    const currentId = get().activeProfileId;
    const validId = me.profiles.find((p) => p.id === currentId)?.id ?? me.profiles[0]?.id ?? null;
    if (validId && validId !== currentId) await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, validId);
    set({ user: me, activeProfileId: validId });
  },

  setActiveProfile: async (id: string) => {
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);
    set({ activeProfileId: id });
  },
}));

export function useActiveProfile(): Profile | null {
  return useAuth((s) => {
    const id = s.activeProfileId;
    return s.user?.profiles?.find((p) => p.id === id) ?? s.user?.profiles?.[0] ?? null;
  });
}
