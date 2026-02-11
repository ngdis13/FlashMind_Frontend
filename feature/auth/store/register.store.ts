import { create } from "zustand";

/**
 * Тип состояния процесса регистрации пользователя.
 *
 * @interface RegistrationStore
 * @property {string} email - Email пользователя, введённый на этапе регистрации.
 * @property {string | null} code - Код подтверждения (например, OTP), полученный пользователем.
 * @property {(email: string) => void} setEmail - Устанавливает или обновляет email в состоянии.
 * @property {(code: string) => void} setCode - Устанавливает или обновляет код подтверждения.
 */
interface RegistrationStore {
  email: string;
  code: string | null;
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
}

/**
 * Zustand-стор для хранения данных процесса регистрации.
 *
 * Используется для:
 * - Временного хранения email пользователя
 * - Хранения кода подтверждения между шагами регистрации
 *
 * Позволяет удобно передавать данные между экранами
 * (например: ввод email → ввод кода подтверждения).
 *
 * @example
 * ```ts
 * const { email, code, setEmail, setCode } = useRegistrationStore();
 *
 * // Сохранить email после ввода
 * setEmail("user@example.com");
 *
 * // Сохранить код подтверждения
 * setCode("123456");
 * ```
 *
 * @returns {RegistrationStore} Состояние регистрации и методы управления
 */
export const useRegistrationStore = create<RegistrationStore>((set) => ({
  // ---------------------------
  // Начальное состояние
  email: "",
  code: null,

  // ---------------------------
  // Обновляет email пользователя
  setEmail: (email) => set({ email }),

  // ---------------------------
  // Обновляет код подтверждения
  setCode: (code) => set({ code }),
}));
