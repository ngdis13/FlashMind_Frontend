import apiClient from "@/shared/api/client";
import { getAuthApiUrl } from "./getAuthApiUrl";
import { FastApiValidationError } from "./types";


type ApiError = { message?: string; detail?: string };

export async function startRegistration(email: string, password: string): Promise<void> {
    try {
        await apiClient.post(getAuthApiUrl("/api/v1/auth/register"), {
          email,
          password,
        });
      } catch (err: any) {
        const errorData = err.response?.data as FastApiValidationError;
    
        if (errorData?.detail && Array.isArray(errorData.detail)) {
          const firstError = errorData.detail[0]?.msg;
          throw new Error(firstError || "Ошибка валидации");
        }

        throw new Error("Не удалось начать регистрацию");
      }
}

export async function verifyCode(email: string, code: string): Promise<{ access_token: string }> {
  try {
    const resp = await apiClient.post<{ access_token: string }>(
        getAuthApiUrl("/api/v1/auth/register/verify-code"),
      { email, code }
    );
    return resp.data;
  } catch (err: any) {
    const errorData = err.response?.data as ApiError | undefined;
    throw new Error(
      errorData?.message ||
      errorData?.detail ||
      "Неверный код или ошибка сервера"
    );
  }
}

export async function resendCode(email: string): Promise<void> {
  try {
    await apiClient.post(getAuthApiUrl("/api/v1/auth/register/resend-code"), {
      email,
    });
  } catch (err: any) {
    const errorData = err.response?.data as ApiError | undefined;
    throw new Error(
      errorData?.message || "Не удалось повторно отправить код"
    );
  }
}
