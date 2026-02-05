import apiClient from "@/shared/api/client";
import { getAuthApiUrl } from "./getAuthApiUrl";
import { FastApiValidationError } from "./types";
import { AxiosError } from "axios";

interface ApiError { 
  message?: string; 
  detail?: string; 
}

/**
 * Начало регистрации пользователя
 */
export async function startRegistration(email: string, password: string): Promise<void> {
  try {
    await apiClient.post(getAuthApiUrl("/api/v1/auth/register"), {
      email,
      password,
    });
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorData = err.response?.data as FastApiValidationError | undefined;

      if (errorData?.detail) {
        // Если detail массив с объектами {msg, loc, type}
        if (Array.isArray(errorData.detail)) {
          const firstError = errorData.detail[0]?.msg;
          throw new Error(firstError || "Ошибка валидации");
        }

        // Если detail строка
        if (typeof errorData.detail === "string") {
          throw new Error(errorData.detail);
        }
      }
    }

    throw new Error("Не удалось начать регистрацию");
  }
}

/**
 * Проверка кода подтверждения регистрации
 */
export async function verifyCode(email: string, code: string): Promise<{ access_token: string }> {
  try {
    const resp = await apiClient.post<{ access_token: string }>(
      getAuthApiUrl("/api/v1/auth/register/verify-code"),
      { email, code }
    );
    return resp.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorData = err.response?.data as ApiError | undefined;
      throw new Error(
        errorData?.message ||
        errorData?.detail ||
        "Неверный код или ошибка сервера"
      );
    }

    throw new Error("Неверный код или ошибка сервера");
  }
}

/**
 * Повторная отправка кода подтверждения
 */
export async function resendCode(email: string): Promise<void> {
  try {
    await apiClient.post(getAuthApiUrl("/api/v1/auth/register/resend-code"), {
      email,
    });
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorData = err.response?.data as ApiError | undefined;
      throw new Error(
        errorData?.message || "Не удалось повторно отправить код"
      );
    }

    throw new Error("Не удалось повторно отправить код");
  }
}
