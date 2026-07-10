
import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";
import { Deck, Card, CloudDeckShareResponse, CloudDeckImportResponse } from "../types/types";
import { AxiosError } from "axios";

// ============================================
// 1. ТИПЫ ДЛЯ РАЗНЫХ ОТВЕТОВ
// ============================================

interface DecksResponse {
  decks: Deck[];
}

// ✅ Тип для урезанной карточки (из списка)
interface CardListItem {
  id: string;
  deck_id: string;
  front: string;
  difficulty?: string | null;
  stability?: string | null;
  // ⚠️ НЕТ back!
}

// ✅ Тип для ответа со списком карточек
interface CardsResponse {
  cards: CardListItem[];  // ← Урезанные карточки
  page?: number;
  per_page?: number;
  total?: number;
}

// ✅ Тип для полной карточки
interface FullCardResponse extends Card {
  // Полная карточка с back
}

interface UpdateDeckPayload {
  name: string;
  description: string;
  desired_retention: number;
  maximum_interval: number;
  color: string;
}

// ============================================
// 2. КОЛОДЫ
// ============================================

/**
 * Получить все колоды пользователя с сервера
 */
export const fetchUserDecks = async (): Promise<Deck[]> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log("🌐 Загружаем колоды с сервера...");

    const resp = await apiClient.get<DecksResponse>(
      getMainServiceApiUrl("/api/v1/decks"),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(`✅ Загружено ${resp.data.decks.length} колод`);

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
 * Обновить поля колоды (PUT-запрос)
 */
export const updateDeck = async (deckId: string, payload: UpdateDeckPayload): Promise<void> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`📝 Обновление колоды ${deckId}...`);
    console.log(`📤 Payload:`, payload);
    
    await apiClient.put(
      getMainServiceApiUrl(`/api/v1/decks/${deckId}`), 
      payload,
      { 
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log(`✅ Данные колоды ${deckId} успешно обновлены на сервере`);
  } catch (err) {
    handleApiError(err, "Не удалось обновить поля колоды");
    throw err;
  }
};

/**
 * Удалить колоду по ID
 */
export const deleteDeckOnServer = async (deckId: string): Promise<void> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`🗑️ Удаление колоды ${deckId}...`);

    await apiClient.delete(
      getMainServiceApiUrl(`/api/v1/decks/${deckId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log(`✅ Колода ${deckId} удалена`);
  } catch (err) {
    handleApiError(err, "Не удалось удалить колоду");
    throw err;
  }
};


interface CreateDeckPayload {
  name: string;
  description: string;
  color: string;
}


interface CreateDeckResponse {
  id: string;
  name: string;
  description: string;
  color: string;
}


export async function createNewDeck(payload: CreateDeckPayload): Promise<CreateDeckResponse> {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }
    const resp = await apiClient.post(
      getMainServiceApiUrl("/api/v1/decks"),
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    console.log("Колода создана", resp.data)
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось создать новую колоду");
  }
}



// ============================================
// 3. КАРТОЧКИ
// ============================================

/**
 * Получить карточки по deck_id (УРЕЗАННЫЕ - без back)
 */
export const fetchCards = async (
  deckId?: string,
  page?: number,
  perPage?: number,
): Promise<CardsResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    const params: Record<string, string | number> = {};
    if (deckId) params.deck_id = deckId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;

    const queryString =
      Object.keys(params).length > 0
        ? "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";

    console.log(
      `🌐 Загружаем карточки${deckId ? ` для колоды ${deckId}` : " (все карточки)"}...`,
    );

    const resp = await apiClient.get<CardsResponse>(
      getMainServiceApiUrl(`/api/v1/cards${queryString}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(
      `✅ Загружено ${resp.data.cards.length} карточек${resp.data.total ? ` (всего: ${resp.data.total})` : ""}`,
    );
    
    // ⚠️ Логируем, что back отсутствует
    if (resp.data.cards.length > 0) {
      console.log(`⚠️ Карточки без back (урезанные):`, resp.data.cards[0]);
    }

    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось получить карточки");
    throw err;
  }
};

/**
 * Получить урезанные карточки конкретной колоды
 */
export const fetchDeckCards = async (deckId: string): Promise<CardListItem[]> => {
  console.log(`🌐 API: Запрос урезанных карточек для колоды ${deckId}`);
  try {
    const response = await fetchCards(deckId);
    console.log(`✅ API: Получено ${response.cards?.length || 0} урезанных карточек`);
    return response.cards || [];
  } catch (error) {
    console.error(`❌ API: Ошибка загрузки карточек ${deckId}:`, error);
    throw error;
  }
};

/**
 * Получить ПОЛНУЮ карточку по ID (с back)
 */
export const fetchCardById = async (cardId: string): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`🔍 Загружаем ПОЛНУЮ карточку ${cardId}...`);

    const resp = await apiClient.get<Card>(
      getMainServiceApiUrl(`/api/v1/cards/${cardId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(`✅ Полная карточка загружена:`, {
      id: resp.data.id,
      front: resp.data.front,
      hasBack: !!resp.data.back,
      back: resp.data.back ? `${resp.data.back.substring(0, 30)}...` : 'отсутствует'
    });

    return resp.data;
  } catch (err) {
    console.error(`❌ Ошибка загрузки карточки ${cardId}:`, err);
    handleApiError(err, "Не удалось получить карточку");
    throw err;
  }
};

/**
 * Создать карточку (полная)
 */
export const createCard = async (
  deckId: string,
  data: { front: string; back: string },
): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`📝 Создание карточки в колоде ${deckId}...`);

    const resp = await apiClient.post(
      getMainServiceApiUrl(`/api/v1/cards`),
      {
        deck_id: deckId,
        front: data.front,
        back: data.back,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log("✅ Карточка создана:", resp.data);
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
    throw err;
  }
};

/**
 * Обновить карточку (полная)
 */
export const updateCardOnServer = async (
  cardId: string,
  data: { front: string; back: string }
): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`📝 Обновляем карточку ${cardId}...`);

    const resp = await apiClient.put(
      getMainServiceApiUrl(`/api/v1/cards/${cardId}`),
      {
        front: data.front,
        back: data.back,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("✅ Карточка обновлена:", resp.data);
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось обновить карточку");
    throw err;
  }
};

/**
 * Удалить карточку по ID
 */
export const deleteCard = async (cardId: string): Promise<void> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`🗑️ Удаление карточки ${cardId}...`);

    await apiClient.delete(
      getMainServiceApiUrl(`/api/v1/cards/${cardId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log(`✅ Карточка ${cardId} удалена`);
  } catch (err) {
    handleApiError(err, "Не удалось удалить карточку");
    throw err;
  }
};

// ============================================
// 4. ОБЛАЧНЫЕ КОЛОДЫ
// ============================================

/**
 * Отправить колоду на публикацию (сделать публичной) или синхронизировать 
 */
export const makeDeckPublicApi = async (deckId: string): Promise<CloudDeckShareResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`☁️ Отправка колоды ${deckId} на публикацию...`);

    const response = await apiClient.post<CloudDeckShareResponse>(
      getMainServiceApiUrl("/api/v1/cloud_decks/share"),
      {
        deck_id: deckId,
        type: "PUBLIC",
      },
      { 
        headers: { Authorization: `Bearer ${accessToken}` } 
      }
    );

    console.log(`✅ Колода ${deckId} успешно отправлена на публикацию`);
    return response.data;
  } catch (err) {
    handleApiError(err, "Не удалось опубликовать колоду");
    throw err;
  }
};

/**
 * Импорт облачной колоды для ПОЛЬЗОВАТЕЛЯ
 * POST /api/v1/cloud_decks/import
 */
export const importDeckApi = async (cloudUuid: string): Promise<CloudDeckImportResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`☁️ Импортируем облачную колоду ${cloudUuid}...`);

    const response = await apiClient.post<CloudDeckImportResponse>(
      getMainServiceApiUrl("/api/v1/cloud_decks/import"),
      {
        cloud_uuid: cloudUuid
      },
      { 
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log("✅ Колода успешно импортирована");
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка при импорте облачной колоды:", error);
    handleApiError(error, "Не удалось импортировать колоду");
    throw error;
  }
};