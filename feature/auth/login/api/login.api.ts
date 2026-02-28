import apiClient from "@/api/client";
import { getAuthApiUrl } from "../../api/getAuthApiUrl";
import { FastApiValidationError, ApiErrorResponse } from "@/feature-auth/types/api.types"; 
import { LoginResponse, LoginPayload } from "../types/api.types";
import { AxiosError } from "axios";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";

/**
 * Выполняет авторизацию пользователя с помощью API.
 * Отправляет данные для входа на сервер и возвращает токен доступа.
 * Если вход неудачен, выбрасывает ошибку с подробным сообщением.
 *
 * @param payload - Данные для авторизации, включая email и пароль
 * @returns Токен доступа (Access Token), если авторизация успешна
 * @throws {Error} Если ошибка валидации или ошибка с API
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    // Отправляем запрос на сервер для авторизации
    const resp = await apiClient.post<LoginResponse>(
      getAuthApiUrl("/api/v1/auth/login"),
      payload, 
      {withCredentials: true}
    );

    // Возвращаем ответ с токеном доступа, если все прошло успешно
    return resp.data;
  } catch (err: unknown) {
    // Обработка ошибок при запросе (например, неверные данные или проблемы с сетью)
    if (err instanceof AxiosError) {
      const errorData = err.response?.data as FastApiValidationError | ApiErrorResponse | undefined;

      // Если получена ошибка с деталями, пытаемся извлечь и передать точное сообщение
      if (errorData) {
        // Если ошибка содержит массив деталей (например, ошибки валидации), выбрасываем первое сообщение
        if (Array.isArray(errorData.detail)) {
          throw new Error(errorData.detail[0]?.msg ?? "Ошибка валидации");
        }

        // Если ошибка имеет строковое описание, выбрасываем это сообщение
        if (typeof errorData.detail === "string") {
          throw new Error(errorData.detail);
        }

        // Если в ошибке есть сообщение, передаем его
        if ("message" in errorData && typeof errorData.message === "string") {
          throw new Error(errorData.message);
        }
      }
    }

    // 4️⃣ Fallback: если не удалось извлечь детализированную ошибку, выбрасываем общее сообщение
    throw new Error("Неверный email или пароль");
  }
}


export async function logout(): Promise<unknown>{
  try {
    // Отправляем запрос на сервер для выхода
    const resp = await apiClient.post(
      getMainServiceApiUrl("/logout"),
      {},
      {withCredentials: true}
    );


    return resp.data;
  } catch (err: unknown) {
    // Обработка ошибок при запросе (например, неверные данные или проблемы с сетью)
    if (err instanceof AxiosError) {
      const errorData = err.response?.data as FastApiValidationError | ApiErrorResponse | undefined;

      // Если получена ошибка с деталями, пытаемся извлечь и передать точное сообщение
      if (errorData) {
        // Если ошибка содержит массив деталей (например, ошибки валидации), выбрасываем первое сообщение
        if (Array.isArray(errorData.detail)) {
          throw new Error(errorData.detail[0]?.msg);
        }

        // Если ошибка имеет строковое описание, выбрасываем это сообщение
        if (typeof errorData.detail === "string") {
          throw new Error(errorData.detail);
        }

        // Если в ошибке есть сообщение, передаем его
        if ("message" in errorData && typeof errorData.message === "string") {
          throw new Error(errorData.message);
        }
      }
    }
    throw new Error("Ошибка");
  }
}