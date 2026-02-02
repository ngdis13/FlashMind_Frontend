// store/userStore.ts (или где у тебя стор)
import { create } from 'zustand';

type UserState = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  // ... другие поля и методы
};

export const useUserStore = create<UserState>()((_set) => ({
  isAuthenticated: false,
  login: async (_email, _password) => {
    // твоя логика
  },
}));
