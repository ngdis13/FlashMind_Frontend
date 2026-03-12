import { getAuthApiUrl } from "@/feature/auth/api/getAuthApiUrl";
import apiClient from "./client";
import { LoginResponse } from "@/feature/auth/types/api.types";
import { useAuthStore } from "@/store/auth.store";



export async function refresh(): Promise<LoginResponse> {
  try {
    console.info('обращение на /refresh')
    const resp = await apiClient.post<LoginResponse>(
      getAuthApiUrl("/api/v1/auth/refresh"),
      { withCredentials: true,
        _isRefreshRequest: true
       }, // Обязательно отправляем cookies с refresh token
    );

    const access_token = resp.data.access_token

    const setAccessToken = useAuthStore.getState().setAccessToken; // получаем функцию стора
    setAccessToken(access_token);

    // Обновляем токен в apiClient
    apiClient.defaults.headers["Authorization"] =
      `Bearer ${resp.data.access_token}`;
    
    console.info('Обновлен токен доступа')
    // Получаем новые токены
    return resp.data;
  } catch (_: unknown) {
    console.error('Отсутствует рефреш токен')
    throw Error;
  }
}


