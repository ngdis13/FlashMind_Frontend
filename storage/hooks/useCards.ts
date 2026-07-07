import { useCallback } from "react";
import { useCardStore, StoreCard } from "@/store/card.store";

export const useCards = () => {
  const cardStore = useCardStore();
  const error = cardStore.error;

  const isDeckLoading = useCallback((deckId: string) => {
    return cardStore.isLoading[deckId] || false;
  }, [cardStore.isLoading]);


  const getDeckCards = useCallback(async (deckId: string): Promise<StoreCard[]> => {
    return await cardStore.getCards(deckId);
  }, [cardStore.getCards]);

  const invalidateDeckCards = useCallback((deckId: string) => {
    cardStore.invalidateCards(deckId);
  }, [cardStore.invalidateCards]);

  // Добавление карточки через стор (теперь без последующих перезагрузок)
  const addCard = useCallback(async (deckId: string, front: string, back: string) => {
    return await cardStore.createCard({ deck_id: deckId, front, back });
  }, [cardStore.createCard]);
  
  // Удаление карточки
  const removeCard = useCallback(async (cardId: string, deckId: string) => {
    await cardStore.deleteCard(cardId, deckId);
  }, [cardStore.deleteCard]);

  // Редактирование карточки
  const updateCard = useCallback(async (cardId: string, front: string, back: string) => {
    return await cardStore.updateCard(cardId, { front, back });
  }, [cardStore.updateCard]);

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
    getCardById,
    clearDeckCards
  };
};
