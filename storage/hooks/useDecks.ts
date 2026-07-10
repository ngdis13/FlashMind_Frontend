import { useCallback, useEffect, useRef } from "react";
import { useDeckStore } from "@/store/deck.store";
import { Deck, DeckSettings } from "../types/types";

export const useDecks = () => {
  const deckStore = useDeckStore();

  // Достаем массив колод из нашей новой структуры decksState
  const decks = deckStore.decksState?.decks || [];
  const loading = deckStore.isLoading;
  const error = deckStore.error;
  const isFirstLoadRef = useRef(true);

  // 1. Умное получение колод (Сеть заблокируется сама внутри getDecks, если кэш валиден)
  const loadDecksData = useCallback(async () => {
    return await deckStore.getDecks();
  }, [deckStore.getDecks]);

  // 2. Принудительное обновление (Pull-to-Refresh)
  const refreshDecks = useCallback(async () => {
    console.log("🔄 [useDecks] Пользователь потянул Pull-to-Refresh. Инвалидируем кэш.");
    deckStore.invalidateDecks(); // Переключаем isActual в false
    return await deckStore.getDecks(); // Делаем чистый GET-запрос к API
  }, [deckStore]);

  // Находим колоду по ID локально в памяти
  const getDeckById = useCallback((deckId: string) => {
    return decks.find(d => d.id === deckId) || null;
  }, [decks]);

  // 3. Редактирование полей колоды и настроек (Оптимистичное с Rollback внутри стора)
  const updateDeckFields = useCallback(async (
    deckId: string, 
    fields: Partial<Deck> & Partial<DeckSettings>
  ) => {
    await deckStore.updateDeck(deckId, fields);
  }, [deckStore.updateDeck]);

  // 4. Удаление колоды (Оптимистичное с Rollback внутри стора)
  const deleteDeck = useCallback(async (deckId: string) => {
    await deckStore.deleteDeck(deckId);
  }, [deckStore.deleteDeck]);

  // 5. Публикация колоды в облако
  const makeDeckPublic = useCallback(async (deckId: string) => {
    // ИСПРАВЛЕНО: Ищем колоду прямо в локальном массиве decks хука, без обращений к стору
    const deck = decks.find(d => d.id === deckId);
    
    if (deck?.cloud_info?.cloud_deck_id) {
      return {
        cloud_uuid: deck.cloud_info.cloud_deck_id,
        status: 'EXISTING',
        message: 'Колода уже опубликована'
      };
    }
    
    const { makeDeckPublicApi } = await import('../api/api');
    const result = await makeDeckPublicApi(deckId);
    
    // Перезапрашиваем данные с сервера
    deckStore.invalidateDecks();
    await deckStore.getDecks();
    
    return result;
  }, [decks, deckStore]);


  // 6.  Импорт колоды из облака
  const importDeck = useCallback(async (cloudUuid: string) => {
    const { importDeckApi } = await import('../api/api');
    const result = await importDeckApi(cloudUuid);
    
    // Вызываем старое принудительное обновление для облака
    await deckStore.getDecks();
    
    return result;
  }, [deckStore]);


  useEffect(() => {
    if (isFirstLoadRef.current) {
      loadDecksData();
      isFirstLoadRef.current = false;
    }
  }, [loadDecksData]);

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
