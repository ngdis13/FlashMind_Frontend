import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { refreshToken } from '../services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

// ==================== Состояние (только const) ====================
const refreshState = {
  isRefreshing: false,
}

type FailedRequest = {
  resolve: (token?: string) => void;
  reject: (error: unknown) => void;
};

const failedQueue: FailedRequest[] = [];

// ==================== Вспомогательная функция ====================
const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);        
    } else {
      resolve(token);       
    }
  });
  failedQueue.length = 0;   
};

// ==================== Основная функция ====================
export function setupAuthInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _skipAuthRefresh?: boolean;
      };

      // Не 401 — сразу пропускаем
      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      // Это сам refresh-запрос → не пытаемся обновить токен ещё раз
      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      // Флаг _skipAuthRefresh позволяет принудительно отключить refresh.
      const hasAuthHeader = Boolean(originalRequest.headers?.Authorization);
      if (!hasAuthHeader || originalRequest._skipAuthRefresh) {
        return Promise.reject(error);
      }

      // Уже идёт обновление токена → ставим запрос в очередь
      if (refreshState.isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      // Первый запрос начинает refresh
      refreshState.isRefreshing = true;   // ← мутация объекта, а не let

      try {
        const { access_token } = await refreshToken();

        // Разблокируем все запросы из очереди
        processQueue(null, access_token);

        // Повторяем текущий запрос
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (err: unknown) {
        console.log('отсутствует куки')
        processQueue(err);
        useAuthStore.getState().logout();
        router.push('/login')

        return Promise.reject(err);
      } finally {
        refreshState.isRefreshing = false;   // ← снова мутация объекта
      }
    }
  );
}
