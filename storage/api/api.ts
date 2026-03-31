// src/services/api.ts
import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";
import { Deck, Card } from "../types/types";

// 👇 Обновляем интерфейсы под реальный API
interface DecksResponse {
  decks: Deck[];
}

interface CardsResponse {
  cards: Card[];
  page?: number;
  per_page?: number;
  total?: number;
}

/**
 * Получить все колоды пользователя с сервера
 */
export const fetchUserDecks = async (): Promise<Deck[]> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    
    if (!accessToken) {
      console.log("⚠️ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }
    
    console.log("🌐 Загружаем колоды с сервера...");
    
    const resp = await apiClient.get<DecksResponse>(
      getMainServiceApiUrl("/api/v1/decks"),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    console.log(`✅ Загружено ${resp.data.decks.length} колод`);
    
    // Добавляем extraCount для UI и поле cards
    const decksWithExtra = resp.data.decks.map(deck => ({
      ...deck,
      extraCount: 0,
      cards: [],
    }));
    
    return decksWithExtra;
  } catch (err) {
    handleApiError(err, "Не удалось получить колоды пользователя");
    throw err;
  }
};

/**
 * Получить карточки по deck_id (согласно документации)
 * @param deckId - ID колоды (опционально, если не указан - все карточки пользователя)
 * @param page - номер страницы (опционально)
 * @param perPage - количество на странице (опционально)
 */
export const fetchCards = async (
  deckId?: string, 
  page?: number, 
  perPage?: number
): Promise<CardsResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    
    if (!accessToken) {
      console.log("⚠️ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }
    
    // Формируем query параметры
    const params: Record<string, string | number> = {};
    if (deckId) params.deck_id = deckId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;
    
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    
    console.log(`🌐 Загружаем карточки${deckId ? ` для колоды ${deckId}` : ' (все карточки)'}...`);
    
    const resp = await apiClient.get<CardsResponse>(
      getMainServiceApiUrl(`/api/v1/cards${queryString}`),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    console.log(`✅ Загружено ${resp.data.cards.length} карточек${resp.data.total ? ` (всего: ${resp.data.total})` : ''}`);
    
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось получить карточки");
    throw err;
  }
};

/**
 * Получить карточки конкретной колоды (обертка для удобства)
 */
export const fetchDeckCards = async (deckId: string): Promise<Card[]> => {
  try {
    const response = await fetchCards(deckId);
    return response.cards;
  } catch (err) {
    console.error(`Ошибка загрузки карточек колоды ${deckId}:`, err);
    throw err;
  }
};