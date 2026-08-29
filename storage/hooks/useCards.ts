import { useCallback } from "react";
import { useCardStore, StoreCard } from "@/store/card.store";
import { Card, CreateCardPayload, UpdateCardPayload } from "../types/types";

export const useCards = () => {
  const cardStore = useCardStore();
  const error = cardStore.error;

  const isDeckLoading = useCallback((deckId: string) => {
    return cardStore.isLoading[deckId] || false;
  }, [cardStore.isLoading]);

  const getDeckCards = useCallback(
    async (deckId: string): Promise<StoreCard[]> => {
      return await cardStore.getCards(deckId);
    },
    [cardStore.getCards],
  );

  const invalidateDeckCards = useCallback((deckId: string) => {
    cardStore.invalidateCards(deckId);
  }, [cardStore.invalidateCards]);

  // Добавление карточки 
  const addCard = useCallback(async (data: CreateCardPayload) => {
    return await cardStore.createCard(data);
  }, [cardStore.createCard]);

  // Удаление карточки
  const removeCard = useCallback(async (cardId: string, deckId: string) => {
    await cardStore.deleteCard(cardId, deckId);
  }, [cardStore.deleteCard]);

  // Частичное редактирование карточки 
  const updateCard = useCallback(
    async (cardId: string, data: UpdateCardPayload) => {
      return await cardStore.updateCard(cardId, data);
    },
    [cardStore.updateCard],
  );

  // Точечная замена карточки после ревью 
  const replaceCard = useCallback((deckId: string, updatedCard: Card) => {
    cardStore.replaceCard(deckId, updatedCard);
  }, [cardStore.replaceCard]);

  const getCardById = useCallback(async (cardId: string) => {
    return await cardStore.getCardById(cardId);
  }, [cardStore.getCardById]);

  const clearDeckCards = useCallback((deckId?: string) => {
    cardStore.clearCards(deckId);
  }, [cardStore.clearCards]);

  return {
    error,
    isDeckLoading,
    getDeckCards,
    invalidateDeckCards,
    addCard,
    removeCard,
    updateCard,
    replaceCard,
    getCardById,
    clearDeckCards,
  };
};
