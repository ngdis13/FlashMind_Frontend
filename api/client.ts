import axios, { AxiosError, type AxiosInstance } from "axios";
import { setupAuthInterceptor } from "./interceptors/auth.interceptor";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const apiClient: AxiosInstance = axios.create({
  baseURL: "",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ← очень важно для httpOnly refresh-токена
});

//Обработка 401 ошибки
setupAuthInterceptor(apiClient);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response; // Отличный вариант деструктуризации!

      switch (status) {
        case 404:
          router.push("/not-found");
          break;

        case 500:
          Toast.show({
            type: "error",
            text1: "Ошибка сервера, попробуйте снова",
            position: "bottom",
            visibilityTime: 4000,
          });
          break;
      }
    } else if (
      error.message === "Network Error" ||
      error.code === "ERR_NETWORK" ||
      error.request
    ) {
      console.log("Интерцептор поймал ошибку сети!");
      Toast.show({
        type: "error",
        text1: "Проблема с сетью",
        position: "bottom",
        visibilityTime: 4000,
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
