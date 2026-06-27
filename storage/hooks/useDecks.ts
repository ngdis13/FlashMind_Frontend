// hooks/useDecks.ts (исправленная версия с поддержкой новой структуры)

import { useState, useEffect, useCallback } from "react";
import { Deck, Card, CloudDeckShareResponse, CloudDeckImportResponse } from "../types/types";
import {
  loadDecks,
  saveDecks,
  loadDeckCards,
  saveDeckCards,
} from "../service/decksStorage";
import {
  fetchUserDecks,
  fetchDeckCards,
  deleteCard,
  createCard,
  fetchCardById,
  updateCardOnServer,
  updateDeck,
  deleteDeckOnServer,
  makeDeckPublicApi,
  importDeckApi,
} from "../api/api";
import { colors } from "@/styles/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<Card[]>([]);

  /**
   * Загружает данные колод с приоритетом кэша
   *
   * @description
   * Сначала проверяет наличие данных в AsyncStorage.
   * Если данные есть - использует их и запускает фоновую синхронизацию.
   * Если данных нет - загружает с сервера и сохраняет в кэш.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @throws {Error} При ошибке загрузки данных
   *
   * @example
   * // Вызывается автоматически при монтировании
   * useEffect(() => {
   *   loadDecksData();
   * }, []);
   */
  const loadDecksData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Шаг 1: Проверяем AsyncStorage...");
      const storedDecks = await loadDecks();

      if (storedDecks && storedDecks.length > 0) {
        console.log("Используем данные из хранилища");
        setDecks(storedDecks);
        setLoading(false);
        // Запускаем фоновую синхронизацию
        await refreshDecksInBackground();
      } else {
        console.log("Загружаем данные с сервера...");
        const serverDecks = await fetchUserDecks();
        await saveDecks(serverDecks);
        setDecks(serverDecks);
        console.log("Данные сохранены в хранилище");
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
      setError("Не удалось загрузить колоды");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Выполняет фоновую синхронизацию колод с сервером
   *
   * @description
   * Сравнивает данные на сервере с локальным кэшем.
   * Обновляет локальные данные если есть различия.
   * Также синхронизирует количество карточек в колодах.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * // Запускается автоматически после загрузки локальных данных
   * await refreshDecksInBackground();
   */
  const refreshDecksInBackground = async () => {
    try {
      console.log("Фоновая синхронизация с сервером...");
      const serverDecks = await fetchUserDecks();
      const storedDecks = await loadDecks();

      if (JSON.stringify(serverDecks) !== JSON.stringify(storedDecks)) {
        await saveDecks(serverDecks);
        setDecks(serverDecks);
        console.log("Данные колод обновлены из сервера");
      }

      await syncCardsCount(serverDecks);
    } catch (err) {
      console.log("Фоновая синхронизация не удалась, используем кэш");
    }
  };

  /**
   * Синхронизирует количество карточек в колодах
   *
   * @description
   * Проверяет соответствие количества карточек между локальным хранилищем и сервером.
   * При несоответствии загружает актуальные данные с сервера.
   *
   * @async
   * @param {Deck[]} serverDecks - Список колод с сервера
   * @returns {Promise<void>}
   *
   * @example
   * await syncCardsCount(serverDecks);
   */
  const syncCardsCount = useCallback(async (serverDecks: Deck[]) => {
    try {
      console.log("🔍 Проверяем соответствие количества карточек...");

      for (const serverDeck of serverDecks) {
        const localCards = await loadDeckCards(serverDeck.id);
        const localCount = localCards?.length || 0;
        const serverCount = serverDeck.total_cards || 0;

        if (localCount !== serverCount) {
          console.log(`Несоответствие для колоды ${serverDeck.name}:`, {
            local: localCount,
            server: serverCount,
          });

          if (serverCount === 0) {
            await saveDeckCards(serverDeck.id, []);
            console.log(`Очищены карточки колоды ${serverDeck.id}`);
          } else {
            console.log(
              `Загружаем карточки колоды ${serverDeck.id} с сервера...`,
            );
            const serverCards = await fetchDeckCards(serverDeck.id);
            await saveDeckCards(serverDeck.id, serverCards);
            console.log(
              `Обновлены карточки для колоды ${serverDeck.id}: ${serverCards.length} шт.`,
            );
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при синхронизации карточек:", error);
    }
  }, []);

  /**
   * Обновляет поля колоды
   *
   * @description
   * Отправляет обновленные данные на сервер согласно структуре API:
   * {
   *   name: string,
   *   description: string,
   *   desired_retention: number,
   *   maximum_interval: number,
   *   color: string
   * }
   *
   * @async
   * @param {string} deckId - ID колоды для обновления
   * @param {Partial<Deck>} fieldsToUpdate - Объект с полями для обновления
   * @returns {Promise<void>}
   */
  const updateDeckFields = useCallback(
    async (deckId: string, fieldsToUpdate: Partial<Deck>) => {
      try {
        setError(null);

        const currentDeck = decks.find((d) => d.id === deckId);
        if (!currentDeck) {
          throw new Error("Колода не найдена в текущем списке");
        }

        // Извлекаем настройки из fieldsToUpdate или используем текущие
        const currentSettings = currentDeck.settings || {
          desired_retention: 0.9,
          maximum_interval: 365,
          color: colors.mainColor,
        };

        // Получаем значения настроек (поддерживаем оба способа)
        const desiredRetention =
          fieldsToUpdate.settings?.desired_retention ??
          (fieldsToUpdate as any).desired_retention ??
          currentSettings.desired_retention;

        const maximumInterval =
          fieldsToUpdate.settings?.maximum_interval ??
          (fieldsToUpdate as any).maximum_interval ??
          currentSettings.maximum_interval;

        const color =
          fieldsToUpdate.settings?.color ??
          (fieldsToUpdate as any).color ??
          currentSettings.color;

        // Формируем payload строго по структуре API
        const payload = {
          name: fieldsToUpdate.name ?? currentDeck.name,
          description: fieldsToUpdate.description ?? currentDeck.description,
          desired_retention: Number(desiredRetention),
          maximum_interval: Number(maximumInterval),
          color: color,
        };

        console.log("Отправляем на сервер:", payload);

        // Отправляем на сервер
        const response = await updateDeck(deckId, payload);
        console.log("Ответ сервера:", response);

        // Обновляем локальную колоду с правильной структурой
        const updatedDeck: Deck = {
          ...currentDeck,
          name: payload.name,
          description: payload.description,
          settings: {
            desired_retention: payload.desired_retention,
            maximum_interval: payload.maximum_interval,
            color: payload.color,
          },
        };

        // Обновляем в storage
        const updatedDecksList = decks.map((deck) =>
          deck.id === deckId ? updatedDeck : deck,
        );

        await saveDecks(updatedDecksList);
        setDecks(updatedDecksList);

        console.log(`✅ Колода ${deckId} успешно обновлена!`);
      } catch (err) {
        console.error("❌ Ошибка при обновлении полей колоды:", err);
        setError("Не удалось обновить данные колоды");
        throw err;
      }
    },
    [decks],
  );

  /**
   * Получает карточки колоды с автоматической синхронизацией
   *
   * @description
   * Сначала проверяет локальный кэш. Если количество карточек не соответствует
   * ожидаемому или локальных данных нет - загружает с сервера.
   *
   * @async
   * @param {string} deckId - ID колоды
   * @returns {Promise<Card[]>} Массив карточек колоды
   *
   * @example
   * const cards = await getDeckCards('deck123');
   * console.log(`Загружено ${cards.length} карточек`);
   */
  const getDeckCards = useCallback(
    async (deckId: string): Promise<Card[]> => {
      try {
        setLoadingCards((prev) => ({ ...prev, [deckId]: true }));

        const deck = decks.find((d) => d.id === deckId);
        const localCards = await loadDeckCards(deckId);

        const expectedCount = deck?.total_cards || 0;
        const localCount = localCards?.length || 0;

        if (!localCards || localCount !== expectedCount || localCount === 0) {
          console.log(
            `Загружаем карточки колоды ${deckId} с сервера... (ожидается: ${expectedCount}, есть: ${localCount})`,
          );

          const serverCards = await fetchDeckCards(deckId);
          await saveDeckCards(deckId, serverCards);
          setCards(serverCards);

          console.log(`Загружено ${serverCards.length} карточек`);
          return serverCards;
        }

        console.log(
          `Карточки загружены из хранилища (${localCards.length} шт.)`,
        );
        setCards(localCards);
        return localCards;
      } catch (err) {
        console.error(`Ошибка при загрузке карточек колоды ${deckId}:`, err);
        return [];
      } finally {
        setLoadingCards((prev) => ({ ...prev, [deckId]: false }));
      }
    },
    [decks],
  );

  /**
   * Получает колоду по ID
   *
   * @description
   * Ищет колоду в локальном состоянии по ID.
   *
   * @param {string} deckId - ID колоды
   * @returns {Deck | undefined} Найденная колода или undefined
   *
   * @example
   * const deck = getDeckById('deck123');
   * if (deck) {
   *   console.log(`Найдена колода: ${deck.name}`);
   * }
   */
  const getDeckById = useCallback(
    (deckId: string): Deck | undefined => {
      return decks.find((deck) => deck.id === deckId);
    },
    [decks],
  );

  /**
   * Обновляет дополнительный счетчик колоды
   *
   * @description
   * Используется для хранения дополнительной информации о колоде.
   *
   * @async
   * @param {string} deckId - ID колоды
   * @param {number} extraCount - Новое значение дополнительного счетчика
   * @returns {Promise<void>}
   *
   * @example
   * await updateDeckExtraCount('deck123', 5);
   */
  const updateDeckExtraCount = useCallback(
    async (deckId: string, extraCount: number) => {
      try {
        const updatedDecks = decks.map((deck) =>
          deck.id === deckId ? { ...deck, extraCount } : deck,
        );
        setDecks(updatedDecks);
        await saveDecks(updatedDecks);
        console.log(
          `extraCount для колоды ${deckId} обновлен на ${extraCount}`,
        );
      } catch (err) {
        console.error("Ошибка при обновлении extraCount:", err);
      }
    },
    [decks],
  );

  /**
   * Удаляет колоду
   *
   * @description
   * Удаляет колоду на сервере, обновляет локальное состояние,
   * удаляет связанные карточки из AsyncStorage.
   *
   * @async
   * @param {string} deckId - ID колоды для удаления
   * @returns {Promise<void>}
   *
   * @throws {Error} При ошибке удаления на сервере
   *
   * @example
   * try {
   *   await deleteDeck('deck123');
   *   console.log('Колода удалена');
   * } catch (error) {
   *   console.error('Ошибка удаления:', error);
   * }
   */
  const deleteDeck = useCallback(
    async (deckId: string) => {
      try {
        setLoading(true);
        await deleteDeckOnServer(deckId);

        const updatedDecks = decks.filter((deck) => deck.id !== deckId);
        setDecks(updatedDecks);
        await saveDecks(updatedDecks);

        const cardsKey = `@flashcards/deck_cards_${deckId}`;
        await AsyncStorage.removeItem(cardsKey);

        console.log(`Колода ${deckId} успешно удалена`);
      } catch (err) {
        console.error(`Ошибка при удалении колоды ${deckId}:`, err);
        setError("Не удалось удалить колоду");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [decks],
  );

  /**
   * Принудительно обновляет список колод с сервера
   *
   * @description
   * Загружает актуальные данные с сервера, обновляет кэш и состояние.
   * Также синхронизирует количество карточек.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * // Использовать при pull-to-refresh
   * await refreshDecks();
   */
  const refreshDecks = useCallback(async () => {
    try {
      setLoading(true);
      const serverDecks = await fetchUserDecks();
      await saveDecks(serverDecks);
      setDecks(serverDecks);

      await syncCardsCount(serverDecks);

      console.log("Колоды обновлены");
    } catch (err) {
      console.error("Ошибка при обновлении колод:", err);
      setError("Не удалось обновить колоды");
    } finally {
      setLoading(false);
    }
  }, [syncCardsCount]);

  /**
   * Удаляет карточку из колоды
   *
   * @description
   * Удаляет карточку на сервере и обновляет локальные данные:
   * - Удаляет карточку из кэша колоды
   * - Обновляет счетчик карточек в колоде
   *
   * @async
   * @param {string} deckId - ID колоды
   * @param {string} cardId - ID карточки для удаления
   * @returns {Promise<void>}
   *
   * @throws {Error} При ошибке удаления на сервере
   *
   * @example
   * try {
   *   await removeCard('deck123', 'card456');
   *   console.log('Карточка удалена');
   * } catch (error) {
   *   console.error('Ошибка удаления карточки:', error);
   * }
   */
  const removeCard = useCallback(
    async (deckId: string, cardId: string) => {
      try {
        await deleteCard(cardId);
        const currentCards = await loadDeckCards(deckId);
        if (currentCards) {
          const updatedCards = currentCards.filter(
            (card) => card.id !== cardId,
          );
          await saveDeckCards(deckId, updatedCards);
        }

        const updatedDecks = decks.map((deck) =>
          deck.id === deckId
            ? { ...deck, total_cards: Math.max(0, (deck.total_cards || 1) - 1) }
            : deck,
        );
        setDecks(updatedDecks);
        await saveDecks(updatedDecks);

        console.log(`Карточка ${cardId} удалена`);
      } catch (error) {
        console.error("Ошибка при удалении карточки:", error);
        throw error;
      }
    },
    [decks],
  );

  /**
   * Добавляет новую карточку в колоду
   *
   * @description
   * Создает карточку на сервере и обновляет локальные данные:
   * - Добавляет карточку в кэш колоды
   * - Увеличивает счетчик карточек в колоде
   *
   * @async
   * @param {string} deckId - ID колоды
   * @param {string} front - Текст на лицевой стороне
   * @param {string} back - Текст на обратной стороне
   * @returns {Promise<Card>} Созданная карточка
   *
   * @throws {Error} При ошибке создания на сервере
   *
   * @example
   * try {
   *   const newCard = await addCard('deck123', 'Вопрос', 'Ответ');
   *   console.log(`Создана карточка: ${newCard.id}`);
   * } catch (error) {
   *   console.error('Ошибка создания карточки:', error);
   * }
   */
  const addCard = useCallback(
    async (deckId: string, front: string, back: string) => {
      try {
        const newCard = await createCard(deckId, { front, back });

        setCards((prevCards) => [...prevCards, newCard]);

        const currentCards = await loadDeckCards(deckId);
        if (currentCards) {
          await saveDeckCards(deckId, [...currentCards, newCard]);
        } else {
          await saveDeckCards(deckId, [newCard]);
        }

        const updatedDecks = decks.map((deck) =>
          deck.id === deckId
            ? { ...deck, total_cards: (deck.total_cards || 0) + 1 }
            : deck,
        );
        setDecks(updatedDecks);
        await saveDecks(updatedDecks);

        console.log(`Карточка "${front}" создана`);
        return newCard;
      } catch (error) {
        console.error("Ошибка при создании карточки:", error);
        throw error;
      }
    },
    [decks],
  );

  /**
   * Получает карточку по ID с кэшированием
   *
   * @description
   * Сначала ищет карточку в локальном кэше.
   * Если не находит - загружает с сервера и добавляет в кэш.
   *
   * @async
   * @param {string} cardId - ID карточки
   * @returns {Promise<Card | null>} Найденная карточка или null
   *
   * @example
   * const card = await getCardById('card456');
   * if (card) {
   *   console.log(`Карточка: ${card.front} -> ${card.back}`);
   * }
   */
  const getCardById = useCallback(
    async (cardId: string): Promise<Card | null> => {
      try {
        console.log(`Ищем карточку ${cardId}...`);

        const foundCard = cards.find((c) => c.id === cardId);
        if (foundCard) {
          console.log("Карточка найдена в кэше");
          return foundCard;
        }

        const cardFromServer = await fetchCardById(cardId);
        setCards((prevCards) => {
          if (prevCards.some((c) => c.id === cardFromServer.id)) {
            return prevCards;
          }
          return [...prevCards, cardFromServer];
        });

        console.log("Карточка загружена с сервера");
        return cardFromServer;
      } catch (error) {
        console.error("Ошибка получения карточки:", error);
        return null;
      }
    },
    [cards],
  );

  /**
   * Обновляет существующую карточку
   *
   * @description
   * Обновляет карточку на сервере и синхронизирует локальные данные:
   * - Обновляет в глобальном кэше карточек
   * - Обновляет в кэше соответствующей колоды
   *
   * @async
   * @param {string} cardId - ID карточки для обновления
   * @param {string} front - Новый текст на лицевой стороне
   * @param {string} back - Новый текст на обратной стороне
   * @returns {Promise<Card | null>} Обновленная карточка
   *
   * @throws {Error} При ошибке обновления на сервере
   *
   * @example
   * try {
   *   const updatedCard = await updateCard('card456', 'Новый вопрос', 'Новый ответ');
   *   console.log('Карточка обновлена');
   * } catch (error) {
   *   console.error('Ошибка обновления карточки:', error);
   * }
   */
  const updateCard = useCallback(
    async (
      cardId: string,
      front: string,
      back: string,
    ): Promise<Card | null> => {
      try {
        console.log(`Обновляем карточку ${cardId}...`);

        const updatedCard = await updateCardOnServer(cardId, { front, back });

        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === cardId
              ? { ...card, front: updatedCard.front, back: updatedCard.back }
              : card,
          ),
        );

        for (const deck of decks) {
          const deckCards = await loadDeckCards(deck.id);
          if (deckCards?.some((card) => card.id === cardId)) {
            const updatedDeckCards = deckCards.map((card) =>
              card.id === cardId ? { ...card, front, back } : card,
            );
            await saveDeckCards(deck.id, updatedDeckCards);
            break;
          }
        }

        console.log(`Карточка ${cardId} обновлена`);
        return updatedCard;
      } catch (error) {
        console.error("Ошибка при обновлении карточки:", error);
        throw error;
      }
    },
    [decks],
  );

  /**
   * Отправить колоду на публикацию или синхронизацию и обновить локальный статус
   */
  const makeDeckPublic = useCallback(
    async (deckId: string): Promise<CloudDeckShareResponse> => {
      try {
        console.log(
          `Отправляем колоду ${deckId} в хуке на публикацию или синхронизацию...`,
        );

        const serverResponse: CloudDeckShareResponse =
          await makeDeckPublicApi(deckId);

        setDecks((prevDecks) => {
          const updatedDecks = prevDecks.map((deck) => {
            if (deck.id === deckId) {
              return {
                ...deck,
                // Приводим поля в соответствие с вашим интерфейсом Deck и CloudInfo
                cloud_info: {
                  ...deck.cloud_info,
                  is_cloud_deck: true,
                  cloud_type: serverResponse.type as "PUBLIC" | "PRIVATE",
                  is_approved: false,
                  needs_sync: false,

                  cloud_deck_id: serverResponse.cloud_uid,

                  ...((deck.cloud_info as any).sync_stats && {
                    sync_stats: serverResponse.sync_stats,
                  }),
                },
              };
            }
            return deck;
          });

          saveDecks(updatedDecks).catch((err) =>
            console.error("Ошибка сохранения колод в локальную память:", err),
          );

          return updatedDecks;
        });

        console.log(`Локальный статус колоды ${deckId} изменен на PUBLIC`);
        return serverResponse;
      } catch (error) {
        console.error("Ошибка при收публикации колоды в хуке:", error);
        throw error;
      }
    },
    [saveDecks],
  );

  /**
   * Импорт облачной колоды для ПОЛЬЗОВАТЕЛЯ
   * Использует эндпоинт /import
   */
  const importDeck = useCallback(
    async (deckId: string): Promise<CloudDeckImportResponse> => {
      try {
        console.log(
          `Импортируем облачную колоду ${deckId} для пользователя...`,
        );

        const serverResponse: CloudDeckImportResponse =
          await importDeckApi(deckId);

        setDecks((prevDecks) => {
          const updatedDecks = prevDecks.map((deck) => {
            if (deck.id === deckId) {
              // Если колода уже существует, обновляем её данными с сервера
              return {
                ...deck,
                name: serverResponse.deck_name || deck.name,
                description:
                  serverResponse.deck_description || deck.description,
                cards: serverResponse.cards || deck.cards,
                cloud_info: {
                  ...deck.cloud_info,
                  is_cloud_deck: true,
                  needs_sync: false,
                  cloud_deck_id: serverResponse.cloud_uid,
                  is_author: false, // Не автор
                  last_imported_at: new Date().toISOString(),
                  ...(serverResponse.sync_stats && {
                    sync_stats: serverResponse.sync_stats,
                  }),
                },
              };
            }
            return deck;
          });

          saveDecks(updatedDecks).catch((err) =>
            console.error("Ошибка сохранения колод в локальную память:", err),
          );

          return updatedDecks;
        });

        console.log(
          `Колода ${deckId} успешно импортирована для пользователя`,
        );
        return serverResponse;
      } catch (error) {
        console.error("Ошибка при импорте облачной колоды:", error);
        throw error;
      }
    },
    [saveDecks],
  );

  useEffect(() => {
    loadDecksData();
  }, [loadDecksData]);

  return {
    decks,
    loading,
    error,
    loadingCards,
    cards,
    getDeckById,
    updateDeckFields,
    deleteDeck,
    getDeckCards,
    updateDeckExtraCount,
    refreshDecks,
    removeCard,
    addCard,
    getCardById,
    updateCard,
    syncCardsCount,
    makeDeckPublic,
    importDeck
  };
};
