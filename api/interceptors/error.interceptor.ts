import { ApiErrorResponse, FastApiValidationError } from "@/feature/auth/types/api.types";
import { AxiosError } from "axios";

/**
 * Функция обработки ошибок с сервера
 * @description
 * Универсальный обработчик ошибок для API запросов. Принимает ошибку неиизвестного типа, 
 * анализирует структуру и выбрасывает новую ошибку с понятным сообщением.
 * Поддерживает обработку:
 * - Axios ошибок с валидационными деталями от FastApi
 * - Стандартных ошибок FastApi с детализацией
 * - Кастомных ошибок API с полем message
 * - Нативных ошибок JavaScript
 * 
 * @param {unknown} err - Перехваченная ошибка любого типа (from catch block)
 * @param {string} defaultMessage - Сообщение по умолчанию, если не удалось извлечь специфичную ошибку
 * 
 * @throws {Error} Всегда выбрасывает ошибку с извлеченным или дефолтным сообщением
 * 
 * @example
 * ```tsx
 * try {
 *   await api.login(data);
 * } catch (error) {
 *   handleApiError(error, "Ошибка при входе в систему");
 * }
 * ```
 *
 * @example
 * ```tsx
 * // В компоненте с react-query
 * const { mutate } = useMutation({
 *   mutationFn: api.register,
 *   onError: (error) => handleApiError(error, "Ошибка регистрации")
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Обработка разных типов ошибок
 * try {
 *   await someRequest();
 * } catch (error) {
 *   // Функция сама определит тип и извлечет сообщение
 *   handleApiError(error, "Что-то пошло не так");
 * }
 * ```
 *
 * @returns {never} Функция никогда не возвращает значение, всегда выбрасывает ошибку
 */
export function handleApiError(err: unknown, defaultMessage: string): never {
  if (err instanceof AxiosError) {
    const data = err.response?.data as FastApiValidationError | ApiErrorResponse | undefined;

    if (data) {
      if (Array.isArray(data.detail)) {
        throw new Error(data.detail[0]?.msg ?? defaultMessage);
      }

      if (typeof data.detail === "string") {
        throw new Error(data.detail);
      }

      if ("message" in data && typeof data.message === "string") {
        throw new Error(data.message);
      }
    }
  }

  if (err instanceof Error) {
    throw new Error(err.message);
  }

  throw new Error(defaultMessage);
}