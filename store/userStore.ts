import { create } from "zustand";

export type UserProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUri: string | null;
};

type UserState = {
  isAuthenticated: boolean;
  user: UserProfile | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  updateProfile: (data: Partial<UserProfile>) => void;
  setAvatar: (uri: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,

  user: {
    firstName: "Star",
    lastName: "123456",
    bio: "О себе",
    avatarUri: null,
  },

  login: async (_email, _password) => {
    set({
      isAuthenticated: true,
      user: {
        firstName: "Star",
        lastName: "123456",
        bio: "О себе",
        avatarUri: null,
      },
    });
  },

  logout: () => {
    set({ isAuthenticated: false, user: null });
  },

  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  setAvatar: (uri) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, avatarUri: uri } // Правильное обновление состояния
        : null,
    })),
}));
