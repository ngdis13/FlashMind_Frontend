import { useCallback } from "react";
import { useCardStore, StoreCard  } from "@/store/card.store";

export const useCards = () => {
  const cardStore = useCardStore();

  const error = cardStore.error;

  // Функция для проверки, загружается ли конкретная колода прямо сейчас
  const isDeckLoading = useCallback((deckId: string) => {
    return cardStore.isLoading[deckId] || false;
  }, [cardStore.isLoading]);

  // Внедрение новой логики получения карточек 
  const getDeckCards = useCallback(async (deckId: string): Promise<StoreCard[]> => {
    // getCards сама проверит стейт/диск, сходит в API если надо, поставит true и вернет карточки
    return await cardStore.getCards(deckId);
  }, [cardStore.getCards]);

  // Внедрение метода сброса актуальности для экрана обучения
  const invalidateDeckCards = useCallback((deckId: string) => {
    cardStore.invalidateCards(deckId);
  }, [cardStore.invalidateCards]);

  const addCard = useCallback(async (deckId: string, front: string, back: string) => {
    return await cardStore.createCard({ deck_id: deckId, front, back });
  }, [cardStore.createCard]);
  
  const removeCard = useCallback(async (cardId: string, deckId: string) => {
    await cardStore.deleteCard(cardId, deckId);
  }, [cardStore.deleteCard]);

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
