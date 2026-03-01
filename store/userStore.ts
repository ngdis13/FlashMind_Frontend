import { getUserProfile } from "@/feature/profile/api/profile.api";
import { create } from "zustand";
import { useAuthStore } from "./auth.store";

export type UserProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string | null;
};

type UserState = {
  user: UserProfile | null;

  isLoading: boolean; // добавим для отслеживания загрузки
  error: string | null; // добавим для ошибок
  lastFetched: number | null;

  setUser: (user: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setAvatar: (uri: string) => void;
  clearUser: () => void;

  fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  setUser: (user) => {
    set({ user, lastFetched: Date.now() });
  },

  fetchUser: async (force = false) => {
    const state = get()
    if (!force && state.user) {
      console.log('Данные уже есть в сторе, использую их');
      return 
    }

    if (state.isLoading){
      console.log('Уже загружается...')
      return
    }

    set({ isLoading: true, error: null });

    try {
      const response = await getUserProfile();
      const mappedUserProfile = {
        firstName: response.first_name,
        lastName: response.last_name,
        bio: response.bio,
        avatarUrl: response.avatar_url || null,
      };
      set({ 
        user: mappedUserProfile ,
        isLoading: false,
        lastFetched: Date.now()
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Ошибка загрузки профиля",
        isLoading: false,
      });
    }
  },


  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  setAvatar: (uri) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatarUri: uri } : null,
    })),

  clearUser: () => set({ user: null }),
}));
