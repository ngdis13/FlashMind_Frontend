import { create } from "zustand";

export type UserProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string | null;
};

type UserState = {
  user: UserProfile | null;

  setUser: (user: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setAvatar: (uri: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => {
    set({ user });
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
