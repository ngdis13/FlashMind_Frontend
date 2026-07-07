import { useCallback, useEffect, useRef } from "react";
import { useDeckStore } from "@/store/deck.store";
import { Deck } from "../types/types";

export const useDecks = () => {
  const deckStore = useDeckStore();

  const decks = deckStore.decks;
  const loading = deckStore.isLoading;
  const error = deckStore.error;
  const isFirstLoadRef = useRef(true);

  const loadDecksData = useCallback(async () => {
    await deckStore.fetchDecks();
  }, [deckStore.fetchDecks]);

  const refreshDecks = useCallback(async () => {
    await deckStore.fetchDecks(true);
  }, [deckStore.fetchDecks]);

  const getDeckById = useCallback((deckId: string) => {
    return deckStore.getDeckById(deckId);
  }, [deckStore.getDeckById]);

  const updateDeckFields = useCallback(async (deckId: string, fields: Partial<Deck>) => {
    await deckStore.updateDeck(deckId, fields);
  }, [deckStore.updateDeck]);

  const deleteDeck = useCallback(async (deckId: string) => {
    await deckStore.deleteDeck(deckId);
  }, [deckStore.deleteDeck]);

  const makeDeckPublic = useCallback(async (deckId: string) => {
    const deck = deckStore.getDeckById(deckId);
    if (deck?.cloud_info?.cloud_deck_id) {
      return {
        cloud_uuid: deck.cloud_info.cloud_deck_id,
        status: 'EXISTING',
        message: 'Колода уже опубликована'
      };
    }
    
    const { makeDeckPublicApi } = await import('../api/api');
    const result = await makeDeckPublicApi(deckId);
    
    await deckStore.fetchDecks(true);
    
    return result;
  }, [deckStore]);

  const importDeck = useCallback(async (cloudUuid: string) => {
    const { importDeckApi } = await import('../api/api');
    const result = await importDeckApi(cloudUuid);
    
    await deckStore.fetchDecks(true);
    
    return result;
  }, [deckStore]);

  useEffect(() => {
    if (isFirstLoadRef.current && decks.length === 0) {
      loadDecksData();
      isFirstLoadRef.current = false;
    }
  }, [decks.length, loadDecksData]);

  return {
    decks,
    loading,
    error,
    
    loadDecksData,
    refreshDecks,
    getDeckById,
    updateDeckFields,
    deleteDeck,
    makeDeckPublic,
    importDeck,
  };
};
