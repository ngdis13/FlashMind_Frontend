import { getAuthApiUrl } from "@/feature/auth/api/getAuthApiUrl";
import apiClient from "./client";
import { LoginPayload, LoginResponse } from "@/feature/auth/types/api.types";
import { RefreshControl } from "react-native";

// Функция для извлечения refresh токена из cookies
const getRefreshTokenFromCookies = () => {
  // Используйте механизм для получения куки из браузера или вашего окружения
  // Например, для браузера это может быть `document.cookie`
  // В случае с React Native это может быть через библиотеку, такую как `react-native-cookies`
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("refresh_token_cookie="))
      ?.split("=")[1] || null
  ); // Возвращаем токен или null, если его нет
};

export async function refresh(): Promise<LoginResponse> {
  try {
    console.log('обращаюсь к рефреш /api/v1/auth/refresh')
    const resp = await apiClient.post<LoginResponse>(
      getAuthApiUrl("/api/v1/auth/refresh"),
      { withCredentials: true }, // Обязательно отправляем cookies с refresh token
    );

    // Обновляем токен в apiClient
    apiClient.defaults.headers["Authorization"] =
      `Bearer ${resp.data.access_token}`;

    // Получаем новые токены
    return resp.data;
  } catch (_: unknown) {
    throw new Error("Не удалось обновить токены");
  }
}
