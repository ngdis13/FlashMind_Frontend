import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";


/**
 * Тип состояния аутентификации пользователя.
 *
 * @typedef {Object} AuthState
 * @property {string | null} accessToken - Токен доступа пользователя. `null`, если пользователь не авторизован.
 * @property {boolean} isAuthenticated - Флаг, указывающий, авторизован ли пользователь.
 * @property {(token: string) => void} setAccessToken - Функция для установки токена доступа и обновления статуса аутентификации.
 * @property {() => void} logout - Функция для выхода пользователя: очищает токен и статус аутентификации.
 */
type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;

  setAccessToken: (token: string) => void;
  logout: () => void;
};

/**
 * Zustand стор для управления состоянием аутентификации пользователя.
 *
 * Хранит токен доступа и статус аутентификации.
 * Позволяет:
 * - Установить токен и пометить пользователя как авторизованного.
 * - Очистить токен и выйти из аккаунта.
 *
 * @example
 * ```ts
 * const { accessToken, isAuthenticated, setAccessToken, logout } = useAuthStore();
 *
 * // Установка токена при логине
 * setAccessToken("someAccessToken");
 *
 * // Выход пользователя
 * logout();
 * ```
 *
 * @returns {AuthState} Состояние аутентификации и методы управления
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,

      setAccessToken: (token) =>
        set({
          accessToken: token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
  )
);