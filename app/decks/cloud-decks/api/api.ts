import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { useAuthStore } from "@/store/auth.store";
import { FetchCloudDecksResponse } from "../types/types";

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

/**
 * 
 * @returns Шаблон карточки облачной колоды
 */
export const fetchCloudDeckCard = async (cloudCardId: string) => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    const response = await apiClient.get(
      getMainServiceApiUrl(`/api/v1/cloud_decks/cards/${cloudCardId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    return response.data; // Возвращает инфо о карточке
  } catch (error) {
    console.error("Ошибка при получении карточки облачной колоды:", error);
    throw error;
  }
};

/**
 * 
 * @returns Все публичные колоды 
 */
export const fetchCloudDecks = async (): Promise<FetchCloudDecksResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    
    const response = await apiClient.get(
      getMainServiceApiUrl("/api/v1/cloud_decks"),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    return response.data; 
  } catch (error) {
    console.error("Ошибка при получении списка облачных колод:", error);
    throw error;
  }
};
