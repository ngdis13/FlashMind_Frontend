// hooks/useDecks.ts (обновленная версия)

import { useState, useEffect, useCallback } from "react";
import { Deck, Card } from "../types/types";
import {
  loadDecks,
  saveDecks,
  loadDeckCards,
  saveDeckCards,
} from "../service/decksStorage";
import { fetchUserDecks, fetchDeckCards } from "../api/api";

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});

  const loadDecksData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Шаг 1: Проверяем AsyncStorage...");
      const storedDecks = await loadDecks();

      if (storedDecks && storedDecks.length > 0) {
        console.log("📱 Используем данные из хранилища");
        setDecks(storedDecks);
        setLoading(false);
        refreshDecksInBackground();
      } else {
        console.log("🌐 Загружаем данные с сервера...");
        const serverDecks = await fetchUserDecks();
        await saveDecks(serverDecks);
        setDecks(serverDecks);
        console.log("💾 Данные сохранены в хранилище");
      }
    } catch (err) {
      console.error("❌ Ошибка при загрузке данных:", err);
      setError("Не удалось загрузить колоды");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDecksInBackground = async () => {
    try {
      console.log("🔄 Фоновая синхронизация с сервером...");
      const serverDecks = await fetchUserDecks();
      const storedDecks = await loadDecks();
      if (JSON.stringify(serverDecks) !== JSON.stringify(storedDecks)) {
        await saveDecks(serverDecks);
        setDecks(serverDecks);
        console.log("📦 Данные обновлены из сервера");
      }
    } catch (err) {
      console.log("⚠️ Фоновая синхронизация не удалась, используем кэш");
    }
  };

  /**
   * Получить карточки колоды
   * 👇 Адаптируем под структуру с front
   */
  const getDeckCards = useCallback(async (deckId: string): Promise<Card[]> => {
    try {
      setLoadingCards((prev) => ({ ...prev, [deckId]: true }));

      // Сначала проверяем хранилище
      let cards = await loadDeckCards(deckId);

      if (cards && cards.length > 0) {
        console.log(`📱 Карточки колоды ${deckId} загружены из хранилища`);
        return cards;
      }

      // Нет в хранилище - грузим с сервера
      console.log(`🌐 Загружаем карточки колоды ${deckId} с сервера...`);
      cards = await fetchDeckCards(deckId);

      // 👇 Трансформируем карточки, если нужно добавить поля
      const transformedCards = cards.map(card => ({
        ...card,
        // Если нужно преобразовать front в question
        // question: card.front,
        // answer: card.back,
      }));

      // Сохраняем в хранилище
      await saveDeckCards(deckId, transformedCards);

      return transformedCards;
    } catch (err) {
      console.error(`❌ Ошибка при загрузке карточек колоды ${deckId}:`, err);
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
        console.log(`✅ extraCount для колоды ${deckId} обновлен на ${extraCount}`);
      } catch (err) {
        console.error("❌ Ошибка при обновлении extraCount:", err);
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
      console.log("🔄 Колоды обновлены");
    } catch (err) {
      console.error("❌ Ошибка при обновлении колод:", err);
      setError("Не удалось обновить колоды");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecksData();
  }, [loadDecksData]);

  return {
    decks,
    loading,
    error,
    loadingCards,
    getDeckById,
    getDeckCards,
    updateDeckExtraCount,
    refreshDecks,
  };
};