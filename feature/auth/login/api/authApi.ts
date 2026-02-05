import apiClient from "@/shared/api/client";
import { getAuthApiUrl } from "../../api/getAuthApiUrl";
import { FastApiValidationError, ApiErrorResponse } from "../../api/types";
import { LoginResponse, LoginPayload } from "../types/ApiTypes";

export async function login(
  payload: LoginPayload
): Promise<LoginResponse> {
  try {
    const resp = await apiClient.post<LoginResponse>(
      getAuthApiUrl("/api/v1/auth/login"),
      payload
    );

    return resp.data;
  } catch (err: any) {
    const errorData =
      err.response?.data as FastApiValidationError | ApiErrorResponse | undefined;
  
    // 1️⃣ FastAPI validation error (422)
    if (errorData?.detail && Array.isArray(errorData.detail)) {
      throw new Error(errorData.detail[0]?.msg ?? "Ошибка валидации");
    }
  
    // 2️⃣ Backend вернул строку
    if (typeof errorData?.detail === "string") {
      throw new Error(errorData.detail);
    }
  
    // 3️⃣ Backend message
    if (errorData?.message) {
      throw new Error(errorData.message);
    }
  
    // 4️⃣ fallback
    throw new Error("Неверный email или пароль");
  }
}
