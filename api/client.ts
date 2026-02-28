import axios, { type AxiosError, type AxiosInstance } from "axios";
import { refreshToken } from "./services/auth.service";
import { setupAuthInterceptor } from "./interceptors/auth.interceptor";

const apiClient: AxiosInstance = axios.create({
  baseURL: "",                                   
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,                           // ← очень важно для httpOnly refresh-токена
});

//Обработка 401 ошибки
setupAuthInterceptor(apiClient)

export default apiClient;
