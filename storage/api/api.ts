// src/services/api.ts
import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";
import { Deck, DecksResponse, DeckCardsResponse, Card } from "../types/types";

/**
 * Получить все колоды пользователя с сервера
 */
export const fetchUserDecks = async (): Promise<Deck[]> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    
    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }
    
    console.log("Загружаем колоды с сервера...");
    
    const resp = await apiClient.get<DecksResponse>(
      getMainServiceApiUrl("/api/v1/decks"),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    console.log(`Загружено ${resp.data.decks.length} колод`);
    
    // Добавляем extraCount для UI 
    const decksWithExtra = resp.data.decks.map(deck => ({
      ...deck,
      extraCount: 0, // Пока 0, потом можно будет задать отдельно
      cards: [],     // Карточки пока не загружены
    }));
    
    return decksWithExtra;
  } catch (err) {
    handleApiError(err, "Не удалось получить колоды пользователя");
  }
};

/**
 * Получить карточки конкретной колоды с сервера
 */
export const fetchDeckCards = async (deckId: string): Promise<Card[]> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    
    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }
    
    console.log(`Загружаем карточки колоды ${deckId}...`);
    
    const resp = await apiClient.get<DeckCardsResponse>(
      getMainServiceApiUrl(`/api/v1/decks/${deckId}/cards`),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    console.log(`Загружено ${resp.data.cards.length} карточек`);
    return resp.data.cards;
  } catch (err) {
    handleApiError(err, "Не удалось получить карточки колоды");

  }
};