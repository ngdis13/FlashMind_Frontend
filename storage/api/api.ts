// src/services/api.ts
import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";
import { Deck, Card } from "../types/types";
import { AxiosError } from "axios";

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
      console.log(" Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(" Загружаем колоды с сервера...");

    const resp = await apiClient.get<DecksResponse>(
      getMainServiceApiUrl("/api/v1/decks"),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(`Загружено ${resp.data.decks.length} колод`);

    // Добавляем extraCount для UI и поле cards
    const decksWithExtra = resp.data.decks.map((deck) => ({
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
  perPage?: number,
): Promise<CardsResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    // Формируем query параметры
    const params: Record<string, string | number> = {};
    if (deckId) params.deck_id = deckId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;

    const queryString =
      Object.keys(params).length > 0
        ? "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";

    console.log(
      `Загружаем карточки${deckId ? ` для колоды ${deckId}` : " (все карточки)"}...`,
    );

    const resp = await apiClient.get<CardsResponse>(
      getMainServiceApiUrl(`/api/v1/cards${queryString}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(
      `Загружено ${resp.data.cards.length} карточек${resp.data.total ? ` (всего: ${resp.data.total})` : ""}`,
    );

    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось получить карточки");
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

/**
 * Удалить карточку по ID
 * @param cardId - ID карточки
 */
export const deleteCard = async (cardId: string): Promise<void> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log("Удаление карточки...");

    await apiClient.delete(getMainServiceApiUrl(`/api/v1/${cardId}`), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`Карточка ${cardId} удалена`);
  } catch (err) {
    handleApiError(err, "Не удалось удалить карточку");
  }
};

export const createCard = async (
  deckId: string,
  data: { front: string; back: string },
): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log("Создание карточки");

    const resp = await apiClient.post(
      getMainServiceApiUrl(`/api/v1/cards`),
      {
        deck_id: deckId,
        front: data.front,
        back: data.back,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log("Карточка создана:", resp.data);
    return resp.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const errorData = err.response?.data;

      if (status === 404) {
        handleApiError(err, "Колода не найдена");
      } else if (status === 409) {
        handleApiError(
          err,
          errorData?.message || "Карточка с таким вопросом уже существует",
        );
      } else {
        handleApiError(err, "Не удалось создать карточку");
      }
    } else {
      handleApiError(err, "Не удалось создать карточку");
    }
  }
};

/**
 * Получить карточку по ID
 * @param cardId - ID карточки
 */
export const fetchCardById = async (cardId: string): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }

    console.log(`Загружаем карточку ${cardId}...`);

    const resp = await apiClient.get(
      getMainServiceApiUrl(`/api/v1/cards${cardId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log("Карточка загружена:", resp.data);
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось получить карточку");
    throw err;
  }
};

/**
 * Обновить карточку
 * @param cardId - ID карточки
 * @param data - данные для обновления (front и back)
 */
export const updateCardOnServer = async (
  cardId: string,
  data: { front: string; back: string }
): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }

    console.log(`📝 Обновляем карточку ${cardId}...`);

    const resp = await apiClient.put(
      getMainServiceApiUrl(`/api/v1/cards${cardId}`),
      {
        front: data.front,
        back: data.back,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("Карточка обновлена:", resp.data);
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось обновить карточку");
  }
};