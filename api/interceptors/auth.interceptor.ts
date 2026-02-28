import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { refreshToken } from '../services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { logout } from '@/feature/auth/login/api/login.api';
import { router, useRouter } from 'expo-router';

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
      reject(error);        // refresh провалился
    } else {
      resolve(token);       // refresh прошёл успешно
    }
  });
  failedQueue.length = 0;   // очищаем очередь без переприсваивания
};

// ==================== Основная функция ====================
export function setupAuthInterceptor(apiClient: AxiosInstance) {
  const router = useRouter()
  apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
      };
      
      // Не 401 — сразу пропускаем
      if (error.response?.status !== 401) {
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
        const _isRefreshRequest = originalRequest.data?.includes('_isRefreshRequest') ?? false;
        if (_isRefreshRequest) {
          console.log('Refresh запрос провалился, выходим из системы');
          throw error
        }

        const { access_token } = await refreshToken();

        // Обновляем токен глобально
        apiClient.defaults.headers.Authorization = `Bearer ${access_token}`;

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
