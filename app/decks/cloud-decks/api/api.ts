import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { useAuthStore } from "@/store/auth.store";
import { FetchCloudDecksResponse } from "../types/types";
import {
  saveCloudDeckPreview,
  loadCloudDeckPreview,
  removeCloudDeckPreview,
} from "@/storage/service/cloudDecksStorage";

// ============================================
// КЭШ ДЛЯ ПРЕВЬЮ ОБЛАЧНЫХ КОЛОД (AsyncStorage)
// ============================================

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 минут

export const fetchCloudDeckPreview = async (cloudDeckId: string) => {
  try {
    // Шаг 1: проверяем кэш в AsyncStorage (как deck.store проверяет isActual + expiresAt)
    const cached = await loadCloudDeckPreview(cloudDeckId);
    const now = Date.now();

    if (cached && cached.isActual && now < cached.expiresAt) {
      const remainingSec = Math.floor((cached.expiresAt - now) / 1000);
      console.log(
        `💾 [Cache HIT] Превью колоды ${cloudDeckId} — из AsyncStorage (осталось ${remainingSec}с)`,
      );
      return cached.data;
    }

    // Шаг 2: кэша нет, неактуален или протух — идём на сервер
    console.log(
      `🌐 [Cache MISS] Превью колоды ${cloudDeckId} — запрос на сервер`,
    );

    const accessToken = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await apiClient.get(
      getMainServiceApiUrl(`/api/v1/flashmind/cloud_decks/${cloudDeckId}`),
      { headers },
    );

    // Шаг 3: сохраняем в AsyncStorage
    await saveCloudDeckPreview(cloudDeckId, {
      isActual: true,
      expiresAt: now + CACHE_TTL_MS,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("Ошибка при получении превью облачной колоды:", error);
    throw error;
  }
};

/**
 * @returns Шаблон карточки облачной колоды
 */
export const fetchCloudDeckCard = async (cloudCardId: string) => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await apiClient.get(
      getMainServiceApiUrl(
        `/api/v1/flashmind/cloud_decks/cards/${cloudCardId}`,
      ),
      { headers },
    );

    return response.data;
  } catch (error) {
    console.error("Ошибка при получении карточки облачной колоды:", error);
    throw error;
  }
};

/**
 * @returns Все публичные колоды
 */
export const fetchCloudDecks = async (): Promise<FetchCloudDecksResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await apiClient.get(
      getMainServiceApiUrl("/api/v1/flashmind/cloud_decks"),
      { headers },
    );

    return response.data;
  } catch (error) {
    console.error("Ошибка при получении списка облачных колод:", error);
    throw error;
  }
};

/**
 * 🗑️ Сбросить кэш превью (вызвать после импорта колоды)
 */
export const invalidatePreviewCache = async (cloudDeckId: string) => {
  await removeCloudDeckPreview(cloudDeckId);
  console.log(`🗑️ [Cache] Кэш превью колоды ${cloudDeckId} очищен`);
};
