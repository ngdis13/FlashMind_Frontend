import { create } from "zustand"

interface User {
  id: string
  email: string
}

interface UserStore {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,

  login: async (email, password) => {
    // Здесь могла бы быть настоящая API-авторизация 👇
    if (email === "test@mail.com" && password === "12345") {
      set({
        user: { id: "1", email },
        token: "fake-jwt-token",
      })
    } else {
      throw new Error("Неверный логин или пароль")
    }
  },

  logout: () => set({ user: null, token: null }),
}))
