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
import { CardBlock } from "@/feature/decks/deck-create-card/types/cardBlocks";

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

  // Черновик создаваемой карточки
  draftTitle: string;
  draftFront: CardBlock[];
  draftBack: CardBlock[];
  draftHint1: string;
  draftHint2: string;

  getCards: (deckId: string) => Promise<StoreCard[]>;
  invalidateCards: (deckId: string) => void;
  invalidateAllCards: () => Promise<void>;
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

  setDraftTitle: (title: string) => void;
  setDraftFront: (blocks: CardBlock[]) => void;
  setDraftBack: (blocks: CardBlock[]) => void;
  setDraftHint1: (hint: string) => void;
  setDraftHint2: (hint: string) => void;
  updateDraftBlockValue: (
    side: "front" | "back",
    blockId: string,
    value: string,
  ) => void;
  resetDraft: () => void;
  addDraftBlock: (side: "front" | "back", block: CardBlock) => void;
  removeDraftBlock: (side: "front" | "back", blockId: string) => void;
};

export const useCardStore = create<CardState>((set, get) => {
  // Жесткий валидатор формата: если прилетает не объект с isActual и cards — падаем
  const validateFormat = (
    deckId: string,
    data: DeckCardsStorage | null | undefined,
  ) => {
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

    draftTitle: "",
    draftFront: [],
    draftBack: [],
    draftHint1: "",
    draftHint2: "",

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

    /**
     * Массовая инвалидация кэша карточек для всех колод.
     * Используется при Pull-to-Refresh для полной синхронизации данных.
     */
    invalidateAllCards: async () => {
      const allCards = get().cards;
      const deckIds = Object.keys(allCards);

      if (deckIds.length === 0) {
        console.log(
          "ℹ️ invalidateAllCards: Нет закэшированных карточек для инвалидации",
        );
        return;
      }

      console.log(
        `🚨 invalidateAllCards: Сбрасываем актуальность для ${deckIds.length} колод`,
      );

      for (const deckId of deckIds) {
        const record = allCards[deckId];
        if (record && record.isActual) {
          const updatedState: DeckCardsStorage = { ...record, isActual: false };
          set((state) => ({
            cards: { ...state.cards, [deckId]: updatedState },
          }));
          await saveDeckCards(deckId, updatedState);
        }
      }

      console.log(
        `✅ invalidateAllCards: Готово. ${deckIds.length} колод инвалидированы.`,
      );
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
      useDeckStore.getState().updateDeckTotalCards(data.deck_id, "increment");
      useDeckStore.getState().markDeckNeedsSync(data.deck_id);
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
        useDeckStore.getState().markDeckNeedsSync(deckId);
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
        useDeckStore.getState().updateDeckTotalCards(deckId, "decrement");
        useDeckStore.getState().markDeckNeedsSync(deckId);
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

    setDraftTitle: (title) => set({ draftTitle: title }),
    setDraftFront: (blocks) => set({ draftFront: blocks }),
    setDraftBack: (blocks) => set({ draftBack: blocks }),
    setDraftHint1: (hint) => set({ draftHint1: hint }),
    setDraftHint2: (hint) => set({ draftHint2: hint }),
    updateDraftBlockValue: (side, blockId, value) =>
      set((state) => {
        const updateBlocks = (blocks: CardBlock[]) =>
          blocks.map((block) => {
            if (block.id !== blockId) return block;
            // Если это картинка, пишем в url. Если текст/термин — в value
            if (block.type === "image") {
              return { ...block, url: value };
            }
            return { ...block, value };
          });

        return side === "front"
          ? { draftFront: updateBlocks(state.draftFront) }
          : { draftBack: updateBlocks(state.draftBack) };
      }),
    resetDraft: () =>
      set({
        draftTitle: "",
        draftFront: [],
        draftBack: [],
        draftHint1: "",
        draftHint2: "",
      }),

    addDraftBlock: (side: "front" | "back", block: CardBlock) => {
      const blocks = side === "front" ? get().draftFront : get().draftBack;
      const updatedBlocks = [...blocks, { ...block, position: blocks.length }];
      if (side === "front") {
        set({ draftFront: updatedBlocks });
      } else {
        set({ draftBack: updatedBlocks });
      }
    },
    removeDraftBlock: (side: "front" | "back", blockId: string) => {
      const currentBlocks =
        side === "front" ? get().draftFront : get().draftBack;

      // 1. Фильтруем массив, полностью вырезая выбранный по id блок
      const filteredBlocks = currentBlocks.filter(
        (block) => block.id !== blockId,
      );

      // 2. Гарантированно переназначаем position на основе актуальных индексов массива
      const updatedBlocks = filteredBlocks.map((block, index) => ({
        ...block,
        position: index, // Первый блок всегда станет 0, второй 1 и так далее
      }));

      // 3. Записываем обновленный массив в нужную сторону черновика
      if (side === "front") {
        set({ draftFront: updatedBlocks });
      } else {
        set({ draftBack: updatedBlocks });
      }
    },
  };
});
