import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";
import {
  Deck,
  Card,
  CardDetailResponse,
  CardsResponse,
  DecksResponse,
  CreateCardPayload,
  UpdateCardPayload,
  CreateDeckPayload,
  UpdateDeckPayload,
  CloudDeckShareResponse,
  CloudDeckImportResponse,
} from "../types/types";
import { AxiosError } from "axios";

// ============================================
// 1. КОЛОДЫ
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
      getMainServiceApiUrl("/api/v1/flashmind/decks"),
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
export const updateDeck = async (
  deckId: string,
  payload: UpdateDeckPayload,
): Promise<void> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`📝 Обновление колоды ${deckId}...`);
    console.log(`📤 Payload:`, payload);

    await apiClient.put(
      getMainServiceApiUrl(`/api/v1/flashmind/decks/${deckId}`),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
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
      getMainServiceApiUrl(`/api/v1/flashmind/decks/${deckId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(`✅ Колода ${deckId} удалена`);
  } catch (err) {
    handleApiError(err, "Не удалось удалить колоду");
    throw err;
  }
};

export async function createNewDeck(payload: CreateDeckPayload): Promise<Deck> {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }
    const resp = await apiClient.post(
      getMainServiceApiUrl("/api/v1/flashmind/decks"),
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    console.log("Колода создана", resp.data);
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось создать новую колоду");
  }
}

// ============================================
// 3. КАРТОЧКИ
// ============================================

/**
 * Получить карточки (v2.0.0 — полные CardResponse, без пагинации)
 */
export const fetchCards = async (deckId?: string): Promise<CardsResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    const queryString = deckId ? `?deck_id=${encodeURIComponent(deckId)}` : "";

    console.log(
      `🌐 Загружаем карточки${deckId ? ` для колоды ${deckId}` : " (все карточки)"}...`,
    );

    const resp = await apiClient.get<CardsResponse>(
      getMainServiceApiUrl(`/api/v1/flashmind/cards${queryString}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(`✅ Загружено ${resp.data.cards.length} карточек (полные CardResponse)`);

    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось получить карточки");
    throw err;
  }
};

/**
 * Получить карточки конкретной колоды (v2.0.0 — полные карточки)
 */
export const fetchDeckCards = async (deckId: string): Promise<Card[]> => {
  console.log(`🌐 API: Запрос карточек для колоды ${deckId}`);
  try {
    const response = await fetchCards(deckId);
    console.log(`✅ API: Получено ${response.cards?.length || 0} карточек`);
    return response.cards || [];
  } catch (error) {
    console.error(`❌ API: Ошибка загрузки карточек ${deckId}:`, error);
    throw error;
  }
};


/**
 * Получить карточку с расширенной статистикой (v2.0.0 — CardDetailResponse)
 */
export const fetchCardById = async (
  cardId: string,
): Promise<CardDetailResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`🔍 Загружаем карточку ${cardId} (CardDetailResponse)...`);

    const resp = await apiClient.get<CardDetailResponse>(
      getMainServiceApiUrl(`/api/v1/flashmind/cards/${cardId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(`✅ Карточка загружена:`, {
      id: resp.data.card.id,
      title: resp.data.card.title,
      hasBack: resp.data.card.back?.length > 0,
      reviewsCount: resp.data.review_history?.length ?? 0,
      lastReview: resp.data.last_review_datetime,
      nextReview: resp.data.next_review_datetime,
    });

    return resp.data;
  } catch (err) {
    console.error(`❌ Ошибка загрузки карточки ${cardId}:`, err);
    handleApiError(err, "Не удалось получить карточку");
    throw err;
  }
};
/**
 * Создать карточку (v2.0.0 — title обязателен, front/back — блоки)
 */
export const createCard = async (data: CreateCardPayload): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`📝 Создание карточки в колоде ${data.deck_id}...`);

    const resp = await apiClient.post(
      getMainServiceApiUrl(`/api/v1/flashmind/cards`),
      data,
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
          errorData?.message || "Карточка с таким названием уже существует",
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
 * Частично обновить карточку (v2.0.0 — передаются только переданные поля)
 */
export const updateCardOnServer = async (
  cardId: string,
  data: UpdateCardPayload,
): Promise<Card> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    // Фильтруем undefined — не переданные поля не должны попасть в тело запроса
    const partialPayload = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    console.log(`📝 Частичное обновление карточки ${cardId}:`, partialPayload);

    const resp = await apiClient.put(
      getMainServiceApiUrl(`/api/v1/flashmind/cards/${cardId}`),
      partialPayload,
      { headers: { Authorization: `Bearer ${accessToken}` } },
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
      getMainServiceApiUrl(`/api/v1/flashmind/cards/${cardId}`),
      { headers: { Authorization: `Bearer ${accessToken}` } },
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
export const makeDeckPublicApi = async (
  deckId: string,
): Promise<CloudDeckShareResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`☁️ Отправка колоды ${deckId} на публикацию...`);

    const response = await apiClient.post<CloudDeckShareResponse>(
      getMainServiceApiUrl("/api/v1/flashmind/cloud_decks/share"),
      {
        deck_id: deckId,
        type: "PUBLIC",
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
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
export const importDeckApi = async (
  cloudUuid: string,
): Promise<CloudDeckImportResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`☁️ Импортируем облачную колоду ${cloudUuid}...`);

    const response = await apiClient.post<CloudDeckImportResponse>(
      getMainServiceApiUrl("/api/v1/flashmind/cloud_decks/import"),
      {
        cloud_uuid: cloudUuid,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Колода успешно импортирована");
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка при импорте облачной колоды:", error);
    handleApiError(error, "Не удалось импортировать колоду");
    throw error;
  }
};

export interface CanTakeOwnershipResponse {
  /** Флаг, изменен ли текст описания колоды пользователем */
  description_changed: boolean;
  /** Количество карточек, которое еще нужно добавить пользователю до 20% порога */
  cards_needed_count: number;
}

/**
 * Проверяет, может ли текущий пользователь стать автором облачной колоды.
 *
 * Функция проверяет два условия:
 * 1. Изменил ли пользователь описание колоды.
 * 2. Имеет ли он не менее 20% своих уникальных карточек в этой колоде.
 *
 * @param {string} deckId - Идентификатор проверяемой облачной колоды в формате UUID.
 * @returns {Promise<CanTakeOwnershipResponse>} Объект с результатами проверки условий авторства.
 * @throws {Error} Если в хранилище отсутствует токен авторизации.
 * @throws {AxiosError} Перевыбрасывает ошибку сети/валидации (например, 422 Validation Error) после обработки.
 *
 */
export const checkCanTakeOwnershipApi = async (
  deckId: string,
): Promise<CanTakeOwnershipResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`☁️ Проверяем права на авторство для колоды ${deckId}...`);

    const response = await apiClient.get<CanTakeOwnershipResponse>(
      getMainServiceApiUrl(
        `/api/v1/flashmind/cloud_decks/${deckId}/can-take-ownership`,
      ),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        validateStatus: (status) => status < 500,
      },
    );

    if (response.status === 404) {
      console.log("⚠️ Эндпоинт проверки авторства не найден (404)");
      return { description_changed: false, cards_needed_count: 999 };
    }

    console.log("✅ Проверка авторства успешно завершена");
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка при проверке прав на авторство колоды:", error);
    handleApiError(
      error,
      "Не удалось проверить возможность стать автором колоды",
    );
  }
};

export interface TakeOwnershipResponse {
  /** UUID новой созданной облачной колоды, где пользователь стал автором */
  cloud_uuid: string;
  /** UUID старой (оригинальной) облачной колоды, от которой отвязались */
  old_cloud_uuid: string;
  /** Статус выполнения операции */
  status: string;
  /** Тип операции */
  type: string;
  /** Статистика синхронизации карточек при переносе */
  sync_stats: {
    added: number;
    updated: number;
    deleted: number;
  };
}

/**
 * Отвязывает локальную колоду от оригинальной облачной колоды и делает текущего пользователя автором новой.
 *
 * В результате операции создается новая независимая облачная колода, привязанная к аккаунту пользователя.
 * Старая облачная колода продолжает существовать отдельно для остальных подписчиков.
 * Перед вызовом этого эндпоинта пользователь должен успешно пройти проверку условий авторства.
 *
 * @param {string} deckId - Идентификатор локальной колоды (UUID), которую нужно отвязать и сделать авторской.
 * @returns {Promise<TakeOwnershipResponse>} Данные об успешном создании новой облачной колоды и статистике синхронизации.
 * @throws {Error} Если в хранилище отсутствует токен авторизации.
 * @throws {AxiosError} Ошибка 400 (не пройдена проверка авторства), 422 (Validation Error) или ошибки сети.
 *
 * @example
 * try {
 *   const result = await takeOwnershipApi("3fa85f64-5717-4562-b3fc-2c963f66afa6");
 *   console.log("Новый облачный UUID колоды:", result.cloud_uuid);
 * } catch (error) {
 *   // Ошибка обработана внутри функции через handleApiError
 * }
 */
export const takeOwnershipApi = async (
  deckId: string,
): Promise<TakeOwnershipResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    console.log(`☁️ Переносим авторство и отвязываем колоду ${deckId}...`);

    const response = await apiClient.post<TakeOwnershipResponse>(
      getMainServiceApiUrl("/api/v1/flashmind/cloud_decks/take-ownership"),
      {
        deck_id: deckId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      "✅ Права автора успешно получены, создана новая облачная колода",
    );
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка при получении прав автора на колоду:", error);
    handleApiError(error, "Не удалось сменить автора колоды");
  }
};
