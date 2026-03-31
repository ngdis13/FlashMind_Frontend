//Для хука управления колодами в сторадже
import { useState, useEffect, useCallback } from "react";
import { Deck, Card } from "../types/types";
import {
  loadDecks,
  saveDecks,
  loadDeckCards,
  saveDeckCards,
} from "../service/decksStorage";
import { fetchUserDecks, fetchDeckCards } from "../api/api";

/**
 * Хук для управления колодами и карточками
 */
export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});

  /**
   * Загрузка начальных данных (колоды)
   */
  const loadDecksData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Шаг 1: Проверяем AsyncStorage...");

      // Сначала проверяем хранилище
      const storedDecks = await loadDecks();

      if (storedDecks && storedDecks.length > 0) {
        // Данные есть в хранилище - используем их
        console.log("📱 Используем данные из хранилища");
        setDecks(storedDecks);
        setLoading(false);

        // В фоне обновляем данные с сервера (если нужно)
        refreshDecksInBackground();
      } else {
        // Данных нет - грузим с сервера
        console.log("Загружаем данные с сервера...");
        const serverDecks = await fetchUserDecks();

        // Сохраняем в хранилище
        await saveDecks(serverDecks);

        setDecks(serverDecks);
        console.log("💾 Данные сохранены в хранилище");
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
      setError("Не удалось загрузить колоды");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Фоновая загрузка актуальных данных с сервера
   */
  const refreshDecksInBackground = async () => {
    try {
      console.log("🔄 Фоновая синхронизация с сервером...");
      const serverDecks = await fetchUserDecks();

      // Проверяем, изменились ли данные
      const storedDecks = await loadDecks();
      if (JSON.stringify(serverDecks) !== JSON.stringify(storedDecks)) {
        await saveDecks(serverDecks);
        setDecks(serverDecks);
        console.log("📦 Данные обновлены из сервера");
      }
    } catch (err) {
      console.log(" Фоновая синхронизация не удалась, используем кэш");
    }
  };

  /**
   * Получить карточки колоды (сначала из хранилища, потом с сервера)
   */
  const getDeckCards = useCallback(async (deckId: string): Promise<Card[]> => {
    try {
      setLoadingCards((prev) => ({ ...prev, [deckId]: true }));

      // Сначала проверяем хранилище
      let cards = await loadDeckCards(deckId);

      if (cards && cards.length > 0) {
        console.log(`Карточки колоды ${deckId} загружены из хранилища`);
        return cards;
      }

      // Нет в хранилище - грузим с сервера
      console.log(`Загружаем карточки колоды ${deckId} с сервера...`);
      cards = await fetchDeckCards(deckId);

      // Сохраняем в хранилище
      await saveDeckCards(deckId, cards);

      return cards;
    } catch (err) {
      console.error(`Ошибка при загрузке карточек колоды ${deckId}:`, err);
      return [];
    } finally {
      setLoadingCards((prev) => ({ ...prev, [deckId]: false }));
    }
  }, []);

  /**
   * Получить колоду по ID
   */
  const getDeckById = useCallback(
    (deckId: string): Deck | undefined => {
      return decks.find((deck) => deck.id === deckId);
    },
    [decks],
  );

  /**
   * Обновить extraCount для колоды
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
   * Обновить список колод (полная синхронизация)
   */
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

  // Загружаем данные при монтировании
  useEffect(() => {
    loadDecksData();
  }, [loadDecksData]);

  return {
    decks, // Все колоды
    loading, // Статус загрузки колод
    error, // Ошибка
    loadingCards, // Статус загрузки карточек по колодам
    getDeckById, // Получить колоду по ID
    getDeckCards, // Получить карточки колоды
    updateDeckExtraCount, // Обновить extraCount
    refreshDecks, // Принудительное обновление с сервера
  };
};
