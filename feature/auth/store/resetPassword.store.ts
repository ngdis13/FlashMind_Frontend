import { create } from "zustand";

/**
 * Тип состояния процесса восстановления пароля.
 *
 * @typedef {Object} ResetPasswordState
 * @property {string} email - Email пользователя, на который отправляется код сброса пароля.
 * @property {string | null} resetToken - Токен для подтверждения сброса пароля.
 * @property {(email: string) => void} setEmail - Устанавливает или обновляет email пользователя.
 * @property {(token: string) => void} setResetToken - Устанавливает или обновляет токен сброса пароля.
 * @property {() => void} clear - Сбрасывает состояние стора (email и resetToken) в начальное значение.
 */
type ResetPasswordState = {
  email: string;
  resetToken: string | null;

  setEmail: (email: string) => void;
  setResetToken: (token: string) => void;
  clear: () => void;
};

/**
 * Zustand-стор для управления процессом восстановления пароля.
 *
 * Используется для:
 * - Хранения email пользователя, который запросил восстановление пароля
 * - Хранения токена подтверждения сброса пароля
 * - Очистки состояния после успешного сброса или отмены процесса
 *
 * @example
 * ```ts
 * const { email, resetToken, setEmail, setResetToken, clear } = useResetPasswordStore();
 *
 * // Установить email при запросе сброса пароля
 * setEmail("user@example.com");
 *
 * // Сохранить токен после верификации кода
 * setResetToken("someResetToken");
 *
 * // Очистить данные после успешного сброса
 * clear();
 * ```
 *
 * @returns {ResetPasswordState} Состояние восстановления пароля и методы управления
 */
export const useResetPasswordStore = create<ResetPasswordState>((set) => ({
  // ---------------------------
  // Начальное состояние
  email: "",
  resetToken: null,

  // ---------------------------
  // Обновляет email пользователя
  setEmail: (email) => set({ email }),

  // ---------------------------
  // Обновляет токен сброса пароля
  setResetToken: (token) => set({ resetToken: token }),

  // ---------------------------
  // Сбрасывает состояние стора к начальному
  clear: () =>
    set({
      email: "",
      resetToken: null,
    }),
}));
