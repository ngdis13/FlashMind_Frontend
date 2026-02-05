import apiClient from "@/shared/api/client";
import { getAuthApiUrl } from "../../api/getAuthApiUrl";
import { FastApiValidationError, ApiErrorResponse } from "../../api/types";
import { LoginResponse, LoginPayload } from "../types/ApiTypes";
import { AxiosError } from "axios";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const resp = await apiClient.post<LoginResponse>(
      getAuthApiUrl("/api/v1/auth/login"),
      payload
    );

    return resp.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorData = err.response?.data as FastApiValidationError | ApiErrorResponse | undefined;
  
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
    throw new Error("Неверный email или пароль");
  }
}
