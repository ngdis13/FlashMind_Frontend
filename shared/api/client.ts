import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "",                                   
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,                           // ← очень важно для httpOnly refresh-токена
});

//глобальный перехватчик ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Здесь можно централизованно обрабатывать 401, 403, 500 и т.д.
    if (error.response?.status === 401) {
      console.warn("Unauthorized → возможно токен истёк");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
