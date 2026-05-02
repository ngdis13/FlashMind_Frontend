// hooks/useDecks.ts (исправленная версия)

import { useState, useEffect, useCallback } from "react";
import { Deck, Card } from "../types/types";
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
} from "../api/api";

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<Card[]>([]);

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
        refreshDecksInBackground();
      } else {
        console.log("Загружаем данные с сервера...");
        const serverDecks = await fetchUserDecks();
        await saveDecks(serverDecks);
        setDecks(serverDecks);
        console.log(" Данные сохранены в хранилище");
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
      setError("Не удалось загрузить колоды");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDecksInBackground = async () => {
    try {
      console.log("Фоновая синхронизация с сервером...");
      const serverDecks = await fetchUserDecks();
      const storedDecks = await loadDecks();
      if (JSON.stringify(serverDecks) !== JSON.stringify(storedDecks)) {
        await saveDecks(serverDecks);
        setDecks(serverDecks);
        console.log("Данные обновлены из сервера");
      }
    } catch (err) {
      console.log("Фоновая синхронизация не удалась, используем кэш");
    }
  };

  /**
   * Получить карточки колоды
   */
  const getDeckCards = useCallback(async (deckId: string): Promise<Card[]> => {
    try {
      setLoadingCards((prev) => ({ ...prev, [deckId]: true }));

      // Сначала проверяем хранилище
      let cards = await loadDeckCards(deckId);

      if (cards && cards.length > 0) {
        console.log(`Карточки колоды ${deckId} загружены из хранилища`);
        setCards(cards);
        return cards;
      }

      // Нет в хранилище - грузим с сервера
      console.log(`Загружаем карточки колоды ${deckId} с сервера...`);
      cards = await fetchDeckCards(deckId);

      const transformedCards = cards.map((card) => ({
        ...card,
      }));

      // Сохраняем в хранилище
      await saveDeckCards(deckId, transformedCards);
      setCards(transformedCards);

      return transformedCards;
    } catch (err) {
      console.error(`Ошибка при загрузке карточек колоды ${deckId}:`, err);
      return [];
    } finally {
      setLoadingCards((prev) => ({ ...prev, [deckId]: false }));
    }
  }, []);

  const getDeckById = useCallback(
    (deckId: string): Deck | undefined => {
      return decks.find((deck) => deck.id === deckId);
    },
    [decks],
  );

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

  const refreshDecks = useCallback(async () => {
    try {
      setLoading(true);
      const serverDecks = await fetchUserDecks();
      await saveDecks(serverDecks);
      setDecks(serverDecks);
      console.log("Колоды обновлены");
    } catch (err) {
      console.error("Ошибка при обновлении колод:", err);
      setError("Не удалось обновить колоды");
    } finally {
      
      setLoading(false);
    }
  }, []);

  /**
   * Удалить карточку
   * @param deckId - ID колоды
   * @param cardId - ID карточки
   */
  const removeCard = useCallback(async (deckId: string, cardId: string) => {
    try {
      // Удаляем на сервере
      await deleteCard(cardId);

      // Обновляем локальное состояние карточек
      setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));

      // Обновляем кэш в AsyncStorage
      const currentCards = await loadDeckCards(deckId);
      if (currentCards) {
        const updatedCards = currentCards.filter((card) => card.id !== cardId);
        await saveDeckCards(deckId, updatedCards);
      }

      console.log(`Карточка ${cardId} удалена локально`);
    } catch (error) {
      console.error("Ошибка при удалении карточки:", error);
      throw error;
    }
  }, []);

  const addCard = useCallback(
    async (deckId: string, front: string, back: string) => {
      try {
        // Создаем карточку на сервере
        const newCard = await createCard(deckId, { front, back });

        // Обновляем локальное состояние карточек
        setCards((prevCards) => [...prevCards, newCard]);

        // Обновляем кэш в AsyncStorage
        const currentCards = await loadDeckCards(deckId);
        if (currentCards) {
          await saveDeckCards(deckId, [...currentCards, newCard]);
        }

        // Обновляем счетчик карточек в колоде
        const updatedDecks = decks.map((deck) =>
          deck.id === deckId
            ? { ...deck, total_cards: deck.total_cards + 1 }
            : deck,
        );
        setDecks(updatedDecks);
        await saveDecks(updatedDecks);

        console.log(`Карточка "${front}" создана в колоде ${deckId}`);
        return newCard;
      } catch (error) {
        console.error("Ошибка при создании карточки:", error);
        throw error;
      }
    },
    [decks],
  );

  const getCardById = useCallback(
    async (cardId: string): Promise<Card | null> => {
      try {
        console.log(`Ищем карточку ${cardId} на сервере...`);

        // Проверяем в кэше сначала
        const foundCard = cards.find((c) => c.id === cardId);
        if (foundCard) {
          console.log("Карточка найдена в кэше");
          return foundCard;
        }

        // Если нет в кэше - загружаем с сервера
        const cardFromServer = await fetchCardById(cardId);

        // Сохраняем в кэш
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

  const updateCard = useCallback(
    async (
      cardId: string,
      front: string,
      back: string,
    ): Promise<Card | null> => {
      try {
        console.log(`Обновляем карточку ${cardId}...`);

        // Обновляем на сервере
        const updatedCard = await updateCardOnServer(cardId, { front, back });

        // Обновляем глобальное состояние карточек
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === cardId
              ? { ...card, front: updatedCard.front, back: updatedCard.back }
              : card,
          ),
        );

        // Обновляем кэш в AsyncStorage для всех колод
        // Находим в какой колоде лежит карточка
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

  // Загружаем данные при монтировании
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
    getDeckCards,
    updateDeckExtraCount,
    refreshDecks,
    removeCard,
    addCard,
    getCardById,
    updateCard
  };
};
