import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { getAuthApiUrl } from "@/feature/auth/api/getAuthApiUrl";
import { ProfilePayload, ProfileResponse } from "@/feature/onboarding/types/api.types";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";

export async function logoutUser(accessToken: string | null): Promise<void> {
  try {
    await apiClient.post(
      getAuthApiUrl("/logout"),
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    useAuthStore.getState().logout();
    router.replace('/login');
  } catch (err) {
    handleApiError(err, "Не удалось выйти из системы");
  }
}


export async function updateProfile(accessToken: string| null, userData: ProfilePayload): Promise<ProfileResponse> {
  try {
    const resp = await apiClient.patch(getMainServiceApiUrl('/api/v1/users/profile'), userData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data"
      },
    })

    return resp.data
  } catch (err){
    handleApiError(err, 'Не удалось обновить данные о пользователе')
  }
}
