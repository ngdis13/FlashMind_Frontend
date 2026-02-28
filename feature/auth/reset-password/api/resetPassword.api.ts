import apiClient from "@/api/client";
import {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
  ChangePasswordPayload,
  ChangePasswordResponse
} from "../types/types.api";
import { getAuthApiUrl } from "../../api/getAuthApiUrl";
import { AxiosError } from "axios";
import { ApiErrorResponse, FastApiValidationError } from "@/feature-auth/types/api.types";
import { useResetPasswordStore } from "../../store/resetPassword.store";

/**
 * Универсальная обработка ошибок API.
 * 
 * Преобразует AxiosError, FastAPI ошибки или стандартные ошибки
 * в читаемое сообщение для пользователя.
 *
 * @param {unknown} err - Ошибка любого типа
 * @param {string} defaultMessage - Сообщение по умолчанию
 * @throws {Error} Человекочитаемое сообщение об ошибке
 */
function handleApiError(err: unknown, defaultMessage: string): never {
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

/**
 * Отправляет запрос на восстановление пароля по email.
 *
 * @async
 * @param {ForgotPasswordPayload} payload - Данные для восстановления пароля (email пользователя)
 * @returns {Promise<ForgotPasswordResponse>} Ответ сервера с информацией о запросе
 * @throws {Error} В случае ошибки запроса или валидации возвращается человекочитаемое сообщение
 */
export async function resetPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  try {
    const resp = await apiClient.post<ForgotPasswordResponse>(
      getAuthApiUrl("/api/v1/auth/forgot-password"),
      payload
    );
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось отправить код подтверждения, попробуйте позже");
  }
}

/**
 * Проверяет код восстановления пароля, отправленный на email.
 *
 * @async
 * @param {VerifyCodePayload} payload - Данные для проверки кода (email и код)
 * @returns {Promise<VerifyCodeResponse>} Ответ сервера о валидности кода
 * @throws {Error} В случае ошибки запроса или неверного кода возвращается человекочитаемое сообщение
 */
export async function verifyResetCode(payload: VerifyCodePayload): Promise<VerifyCodeResponse> {
  try {
    const resp = await apiClient.post<VerifyCodeResponse>(
      getAuthApiUrl("/api/v1/auth/forgot-password/verify-code"),
      payload
    );
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось подтвердить код, попробуйте позже");
  }
}

/**
 * Повторно отправляет код восстановления пароля на email пользователя.
 *
 * @async
 * @param {{ email: string }} payload - Email пользователя
 * @returns {Promise<{ message: string }>} Ответ сервера с подтверждением отправки кода
 * @throws {Error} В случае ошибки запроса или валидации возвращается человекочитаемое сообщение
 */
export async function resendResetCode(payload: { email: string }): Promise<{ message: string }> {
  try {
    const resp = await apiClient.post<{ message: string }>(
      getAuthApiUrl("/api/v1/auth/forgot-password/resend-code"),
      payload
    );
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось отправить код повторно, попробуйте позже");
  }
}

/**
 * Изменяет пароль пользователя, используя токен сброса.
 *
 * @async
 * @param {ChangePasswordPayload} payload - Данные для изменения пароля (новый пароль и подтверждение)
 * @returns {Promise<ChangePasswordResponse>} Ответ сервера о успешной смене пароля
 * @throws {Error} В случае отсутствия токена или ошибки запроса возвращается человекочитаемое сообщение
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const { resetToken } = useResetPasswordStore.getState();
  if (!resetToken) throw new Error("Токен недействителен. Начните процесс заново.");

  try {
    const resp = await apiClient.post<{ message: string }>(
      getAuthApiUrl("/api/v1/auth/forgot-password/change-password"),
      payload,
      {
        headers: {
          Authorization: `Bearer ${resetToken}`,
        },
      }
    );
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось поменять пароль");
  }
}
