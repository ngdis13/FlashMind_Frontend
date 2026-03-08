import apiClient from "@/api/client";
import { getAuthApiUrl } from "@/feature-auth/api/getAuthApiUrl";
import {
  ApiErrorResponse,
  FastApiValidationError,
} from "@/feature-auth/types/api.types";
import { AxiosError } from "axios";
import { RegisterPayload, VerifyCodePayload, ResendCodePayload } from "@/feature-auth/register/types/api.types";
import { ApiError } from "@/feature-auth/types/api.types";
import { useAuthStore } from "@/store/auth.store";

/**
 * Начало регистрации пользователя
 */
export async function startRegistration(
  payload: RegisterPayload
): Promise<void> {
  try {
    await apiClient.post(getAuthApiUrl("/api/v1/auth/register"), 
      payload,
    );
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorData = err.response?.data as
        | FastApiValidationError
        | ApiErrorResponse
        | undefined;

      if (errorData) {
        if (Array.isArray(errorData.detail)) {
          throw new Error(errorData.detail[0]?.msg ?? "Ошибка валидации");
        }

        if (typeof errorData.detail === "string") {
          throw new Error(errorData.detail);
        }

        if ("message" in errorData && typeof errorData.message === "string") {
          throw new Error(errorData.message);
        }
      }
    }

    // 4️⃣ fallback
    throw new Error("Не удалось начать регистрацию");
  }
}

/**
 * Проверка кода подтверждения регистрации
 */
export async function verifyCode(
  payload: VerifyCodePayload
): Promise<{ access_token: string }> {
  try {
    const resp = await apiClient.post<{ access_token: string }>(
      getAuthApiUrl("/api/v1/auth/register/verify-code"),
      payload
    );
    const setAccessToken = useAuthStore.getState().setAccessToken; // получаем функцию стора
    console.log('Получили токен доступа и обновили при регистрации')
    setAccessToken(resp.data.access_token);
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
export async function resendCode(payload: ResendCodePayload): Promise<void> {
  try {
    await apiClient.post(getAuthApiUrl("/api/v1/auth/register/resend-code"), payload);
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
