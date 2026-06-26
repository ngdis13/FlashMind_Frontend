import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { useAuthStore } from "@/store/auth.store";

export const fetchCloudDeckPreview = async (cloudDeckId: string) => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    
    // Делаем GET-запрос к вашему бэкенду для получения метаданных облачной колоды
    const response = await apiClient.get(
      getMainServiceApiUrl(`/api/v1/cloud_decks/${cloudDeckId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    return response.data; // Возвращает инфо о колоде: название, автора, кол-во карточек
  } catch (error) {
    console.error("Ошибка при получении превью облачной колоды:", error);
    throw error;
  }
};