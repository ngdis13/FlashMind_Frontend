import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { ProfileResponse } from "../types/api.types";
import { AxiosError } from "axios";
import {
  ApiErrorResponse,
  FastApiValidationError,
} from "@/feature/auth/types/api.types";
import { useAuthStore } from "@/store/auth.store";

function handleApiError(err: unknown, defaultMessage: string): never {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | FastApiValidationError
      | ApiErrorResponse
      | undefined;

    if (data) {
      if (Array.isArray(data.detail)) {
        throw new Error(data.detail[0]?.msg ?? defaultMessage);
      }

      if (typeof data.detail === "string") {
        throw new Error(data.detail);
      }

      if ("message" in data && typeof data.message === "string") {
        throw new Error(data.message);
      }
    }
  }

  if (err instanceof Error) {
    throw new Error(err.message);
  }

  throw new Error(defaultMessage);
}

export async function getUserProfile(): Promise<ProfileResponse> {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }
    const resp = await apiClient.get(
      getMainServiceApiUrl("/api/v1/users/profile"),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось получить профиль пользователя");
  }
}
