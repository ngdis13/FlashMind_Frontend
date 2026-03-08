import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { ProfileResponse } from "../types/api.types";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { ProfilePayload } from "../types/api.types"
import { useAuthStore } from "@/store/auth.store";

export async function updateUserProfile(userData: ProfilePayload): Promise<ProfileResponse> {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) throw new Error("Нет токена для авторизации");

  try {
    console.log('User дата:', userData)


    const resp = await apiClient.patch(getMainServiceApiUrl("/api/v1/users/profile"), userData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data"
      },
    });

    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось отправить данные профиля");
    throw err;
  }
}

