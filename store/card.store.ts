import { create } from "zustand";
import {
  fetchDeckCards,
  createCard,
  updateCardOnServer,
  deleteCard,
  fetchCardById,
} from "@/storage/api/api";
import { loadDeckCards, saveDeckCards } from "@/storage/service/decksStorage";
import { Card } from "@/storage/types/types";
import { useDeckStore } from "@/store/deck.store"; 


interface StoreCardListItem {
  id: string;
  deck_id: string;
  front: string;
  difficulty?: string | null;
  stability?: string | null;
  back?: never;
}

export type StoreCard = StoreCardListItem | Card;

interface DeckCardsStorage {
  isActual: boolean;
  cards: StoreCard[];
}

type CardState = {
  cards: Record<string, DeckCardsStorage>;
  isLoading: Record<string, boolean>;
  error: string | null;
  lastFetched: Record<string, number>;

  getCards: (deckId: string) => Promise<StoreCard[]>;
  invalidateCards: (deckId: string) => void;
  getCardById: (cardId: string) => Promise<Card | null>;
  createCard: (data: {
    deck_id: string;
    front: string;
    back: string;
  }) => Promise<Card>;
  updateCard: (id: string, data: Partial<Card>) => Promise<Card>;
  deleteCard: (id: string, deckId: string) => Promise<void>;
  clearCards: (deckId?: string) => void;
  // Добавляем прямой метод ручного обновления стора (пригодится хуку)
  setDeckCardsState: (deckId: string, newState: DeckCardsStorage) => void;
};

export const useCardStore = create<CardState>((set, get) => {
  // Жесткий валидатор формата: если прилетает не объект с isActual и cards — падаем
  const validateFormat = (deckId: string, data: any) => {
    if (!data) return;
    const hasCards = Array.isArray(data.cards);
    const hasActualFlag = typeof data.isActual === "boolean";

    if (!hasCards || !hasActualFlag) {
      throw new Error(
        `[Zustand CRITICAL] Нарушен формат данных для колоды ${deckId}! ` +
          `Ожидалось: { cards: StoreCard[], isActual: boolean }. ` +
          `Получено: ${JSON.stringify(data)}.`,
      );
    }
  };

  return {
    cards: {},
    isLoading: {},
    error: null,
    lastFetched: {},

    setDeckCardsState: (deckId, newState) => {
      validateFormat(deckId, newState);
      set((state) => ({
        cards: { ...state.cards, [deckId]: newState },
      }));
    },

    // Внутри useCardStore в файле card.store.ts:

    getCards: async (deckId: string): Promise<StoreCard[]> => {
      const currentRecord = get().cards[deckId];

      // 1. Проверяем оперативку
      if (currentRecord) {
        validateFormat(deckId, currentRecord);
        if (currentRecord.isActual) {
          console.log(
            `📦 getCards: Данные актуальны в памяти для колоды ${deckId}`,
          );
          return currentRecord.cards;
        }
      }

      // 2. Если в памяти нет — проверяем диск
      if (!currentRecord) {
        const diskData = await loadDeckCards(deckId); // Тут уже прилетает { isActual, cards } или null
        if (diskData) {
          validateFormat(deckId, diskData); // Проверяем на жесткое соответствие

          set((state) => ({
            cards: { ...state.cards, [deckId]: diskData },
          }));

          if (diskData.isActual) {
            console.log(
              `💾 getCards: Данные актуальны на диске для колоды ${deckId}`,
            );
            return diskData.cards;
          }
        }
      }

      // 3. Запрос к серверу, если кэш пустой или устарел (isActual === false)
      const record = get().cards[deckId];
      if (!record || record.isActual === false) {
        if (get().isLoading[deckId]) {
          return record?.cards || [];
        }

        set((state) => ({
          isLoading: { ...state.isLoading, [deckId]: true },
          error: null,
        }));

        try {
          console.log(`🌐 getCards: Делаем запрос к API для колоды ${deckId}`);
          const serverCards = await fetchDeckCards(deckId);

          const freshState: DeckCardsStorage = {
            isActual: true,
            cards: serverCards as StoreCard[],
          };

          set((state) => ({
            cards: { ...state.cards, [deckId]: freshState },
            isLoading: { ...state.isLoading, [deckId]: false },
            lastFetched: { ...state.lastFetched, [deckId]: Date.now() },
          }));

          await saveDeckCards(deckId, freshState);

          return serverCards as StoreCard[];
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : "Ошибка загрузки",
            isLoading: { ...state.isLoading, [deckId]: false },
          }));
          return record?.cards || [];
        }
      }

      return record.cards;
    },

    invalidateCards: (deckId: string) => {
      const record = get().cards[deckId];
      if (record) {
        console.log(
          `🚨 invalidateCards: Сброс актуальности для колоды ${deckId}`,
        );
        const updatedState: DeckCardsStorage = { ...record, isActual: false };

        set((state) => ({ cards: { ...state.cards, [deckId]: updatedState } }));
        saveDeckCards(deckId, updatedState);
      }
    },

    getCardById: async (cardId: string): Promise<Card | null> => {
      const allCards = Object.values(get().cards)
        .map((record) => record.cards)
        .flat();
      const found = allCards.find((c) => c.id === cardId);

      if (found && "back" in found && found.back) {
        return found as Card;
      }

      try {
        const fullCard = await fetchCardById(cardId);
        let deckId = "";
        for (const [key, record] of Object.entries(get().cards)) {
          if (record.cards.some((c) => c.id === cardId)) {
            deckId = key;
            break;
          }
        }

        if (deckId) {
          const updatedCards = get().cards[deckId].cards.map((c) =>
            c.id === cardId ? (fullCard as StoreCard) : c,
          );

          const updatedState: DeckCardsStorage = {
            ...get().cards[deckId],
            cards: updatedCards,
          };

          set((state) => ({
            cards: { ...state.cards, [deckId]: updatedState },
          }));
          await saveDeckCards(deckId, updatedState);
        }

        return fullCard;
      } catch (error) {
        return null;
      }
    },

    // ОПТИМИЗИРОВАНО: Добавление НЕ сбрасывает кэш
    createCard: async (data) => {
      const currentRecord = get().cards[data.deck_id] || {
        isActual: true,
        cards: [],
      };
      validateFormat(data.deck_id, currentRecord);

      const newCard = await createCard(data.deck_id, {
        front: data.front,
        back: data.back,
      });

      const updatedState: DeckCardsStorage = {
        isActual: true, // Локальный массив обновлен, повторный GET не нужен!
        cards: [...currentRecord.cards, newCard as StoreCard],
      };

      set((state) => ({
        cards: { ...state.cards, [data.deck_id]: updatedState },
      }));

      await saveDeckCards(data.deck_id, updatedState);
      useDeckStore.getState().updateDeckTotalCards(data.deck_id, 'increment');
      return newCard;
    },

    // ОПТИМИЗИРОВАНО: Редактирование НЕ сбрасывает кэш
    updateCard: async (id, data) => {
      const updated = await updateCardOnServer(
        id,
        data as { front: string; back: string },
      );

      let deckId = "";
      for (const [key, record] of Object.entries(get().cards)) {
        if (record.cards.some((c) => c.id === id)) {
          deckId = key;
          break;
        }
      }

      if (deckId) {
        const updatedState: DeckCardsStorage = {
          isActual: true, // Обновили локально, данные свежие!
          cards: get().cards[deckId].cards.map((card) =>
            card.id === id ? (updated as StoreCard) : card,
          ),
        };

        set((state) => ({
          cards: { ...state.cards, [deckId]: updatedState },
        }));

        await saveDeckCards(deckId, updatedState);
      }

      return updated;
    },

    // ОПТИМИЗИРОВАНО: Удаление НЕ сбрасывает кэш
    deleteCard: async (id, deckId) => {
      await deleteCard(id);

      const currentRecord = get().cards[deckId];
      if (currentRecord) {
        const updatedState: DeckCardsStorage = {
          isActual: true, // Локально удалили, синхронизация с сервером сохранена
          cards: currentRecord.cards.filter((card) => card.id !== id),
        };

        set((state) => ({
          cards: { ...state.cards, [deckId]: updatedState },
        }));

        await saveDeckCards(deckId, updatedState);
        useDeckStore.getState().updateDeckTotalCards(deckId, 'decrement');
      }
    },

    clearCards: (deckId?: string) => {
      if (deckId) {
        set((state) => {
          const { [deckId]: _, ...remainingFetched } = state.lastFetched;
          return {
            cards: {
              ...state.cards,
              [deckId]: { isActual: false, cards: [] as StoreCard[] },
            },
            lastFetched: remainingFetched,
          };
        });
      } else {
        set({ cards: {}, lastFetched: {} });
      }
    },
  };
});
