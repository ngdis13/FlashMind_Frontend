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
};

export const useCardStore = create<CardState>((set, get) => ({
  cards: {},
  isLoading: {},
  error: null,
  lastFetched: {},

  // Умное получение карточек с проверкой актуальности
  getCards: async (deckId: string): Promise<StoreCard[]> => {
    const currentRecord = get().cards[deckId];

    if (!currentRecord) {
      const diskData = await loadDeckCards(deckId);
      if (diskData) {
        const isNewFormat =
          diskData && typeof diskData === "object" && "isActual" in diskData;

        const normalizedDiskCache: DeckCardsStorage = isNewFormat
          ? (diskData as unknown as DeckCardsStorage)
          : { isActual: true, cards: diskData as unknown as StoreCard[] };

        set((state) => ({
          cards: { ...state.cards, [deckId]: normalizedDiskCache },
        }));

        if (normalizedDiskCache.isActual) {
          console.log(
            `getCards: Данные актуальны на диске для колоды ${deckId}`,
          );
          return normalizedDiskCache.cards;
        }
      }
    }

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

        // СТАНЕТ: Передаем на диск строго массив карточек, как и требовал decksStorage
        await saveDeckCards(deckId, freshState.cards as Card[]);

        return serverCards as StoreCard[];
      } catch (error) {
        set((state) => ({
          error: error instanceof Error ? error.message : "Ошибка загрузки",
          isLoading: { ...state.isLoading, [deckId]: false },
        }));
        return record?.cards || [];
      }
    }

    console.log(`📦 getCards: Данные актуальны в памяти для колоды ${deckId}`);
    return record.cards;
  },

  // Инвалидация (сброс актуальности)
  invalidateCards: (deckId: string) => {
    const record = get().cards[deckId];

    if (record) {
      console.log(
        `🚨 invalidateCards: Меняем флаг на false для колоды ${deckId}`,
      );

      const updatedState: DeckCardsStorage = {
        ...record,
        isActual: false,
      };

      set((state) => ({
        cards: { ...state.cards, [deckId]: updatedState },
      }));

      // Передаем на диск строго массив карточек!
      saveDeckCards(deckId, updatedState.cards as Card[]);
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

        await saveDeckCards(deckId, updatedState as unknown as Card[]);
      }

      return fullCard;
    } catch (error) {
      return null;
    }
  },

  // Создание карточки
  createCard: async (data) => {
    const newCard = await createCard(data.deck_id, {
      front: data.front,
      back: data.back,
    });

    const currentRecord = get().cards[data.deck_id] || {
      isActual: true,
      cards: [],
    };
    const updatedState: DeckCardsStorage = {
      ...currentRecord,
      cards: [...currentRecord.cards, newCard as StoreCard],
    };

    set((state) => ({
      cards: { ...state.cards, [data.deck_id]: updatedState },
    }));

    await saveDeckCards(data.deck_id, updatedState as unknown as Card[]);
    return newCard;
  },

  // Обновление карточки
  updateCard: async (id: string, data: Partial<Card>) => {
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
        ...get().cards[deckId],
        cards: get().cards[deckId].cards.map((card) =>
          card.id === id ? (updated as StoreCard) : card,
        ),
      };

      set((state) => ({
        cards: { ...state.cards, [deckId]: updatedState },
      }));
      await saveDeckCards(deckId, updatedState as unknown as Card[]);
    }

    return updated;
  },

  // 🗑️ Удаление карточки (убран избыточный try/catch)
  deleteCard: async (id: string, deckId: string) => {
    await deleteCard(id);

    const currentRecord = get().cards[deckId];
    if (currentRecord) {
      const updatedState: DeckCardsStorage = {
        ...currentRecord,
        cards: currentRecord.cards.filter((card) => card.id !== id),
      };

      set((state) => ({
        cards: { ...state.cards, [deckId]: updatedState },
      }));

      await saveDeckCards(deckId, updatedState as unknown as Card[]);
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
}));
