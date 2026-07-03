
import { create } from "zustand";
import { 
  fetchDeckCards, 
  createCard, 
  updateCardOnServer, 
  deleteCard 
} from "@/storage/api/api";
import { loadDeckCards, saveDeckCards } from "@/storage/service/decksStorage";
import { Card } from "@/storage/types/types";

type CardState = {
  cards: Record<string, Card[]>; // { deckId: [cards] }
  isLoading: Record<string, boolean>;
  error: string | null;
  fetchCards: (deckId: string, force?: boolean) => Promise<void>;
  getCards: (deckId: string) => Card[];
  createCard: (data: { deck_id: string; front: string; back: string }) => Promise<Card>;
  updateCard: (id: string, data: Partial<Card>) => Promise<Card>;
  deleteCard: (id: string, deckId: string) => Promise<void>;
};

export const useCardStore = create<CardState>((set, get) => ({
  cards: {},
  isLoading: {},
  error: null,

// store/card.store.ts - обновленный fetchCards
fetchCards: async (deckId: string, force = false) => {
  console.log(`🔍 fetchCards вызван для ${deckId}, force: ${force}`);
  
  // Если уже есть карточки - используем кэш
  if (!force && get().cards[deckId] && get().cards[deckId].length > 0) {
    console.log(`📦 Карточки для колоды ${deckId} уже загружены (${get().cards[deckId].length} шт.)`);
    return;
  }

  // Защита от дублирующихся запросов
  if (get().isLoading[deckId]) {
    console.log(`⏳ Запрос карточек для ${deckId} уже выполняется, пропускаю`);
    return;
  }

  set((state) => ({ 
    isLoading: { ...state.isLoading, [deckId]: true },
    error: null 
  }));

  try {
    // Проверяем AsyncStorage
    console.log(`💾 Проверяем кэш для ${deckId}...`);
    const cached = await loadDeckCards(deckId);
    console.log(`📦 В кэше: ${cached?.length || 0} карточек`);
    
    if (cached && cached.length > 0 && !force) {
      console.log(`✅ Использую кэш: ${cached.length} карточек`);
      set((state) => ({
        cards: { ...state.cards, [deckId]: cached },
        isLoading: { ...state.isLoading, [deckId]: false }
      }));
      return;
    }

    // Запрос к серверу
    console.log(`🌐 Загружаем карточки для ${deckId} с сервера...`);
    const serverCards = await fetchDeckCards(deckId);
    console.log(`📥 Получено ${serverCards?.length || 0} карточек с сервера`);
    
    if (serverCards && serverCards.length > 0) {
      await saveDeckCards(deckId, serverCards);
      console.log(`💾 Сохранено ${serverCards.length} карточек в кэш`);
    } else {
      console.log(`⚠️ Сервер вернул 0 карточек для колоды ${deckId}`);
    }
    
    set((state) => ({
      cards: { ...state.cards, [deckId]: serverCards || [] },
      isLoading: { ...state.isLoading, [deckId]: false }
    }));
  } catch (error) {
    console.error('❌ Ошибка загрузки карточек:', error);
    set((state) => ({
      error: error instanceof Error ? error.message : 'Ошибка загрузки',
      isLoading: { ...state.isLoading, [deckId]: false }
    }));
  }
},

  getCards: (deckId: string) => {
    return get().cards[deckId] || [];
  },

  // ⭐ СОЗДАНИЕ - только 1 POST запрос
  createCard: async (data) => {
    try {
      console.log(`📝 Создаем карточку в колоде ${data.deck_id}...`);
      const newCard = await createCard(data.deck_id, { 
        front: data.front, 
        back: data.back 
      });
      
      // Добавляем локально
      set((state) => ({
        cards: {
          ...state.cards,
          [data.deck_id]: [...(state.cards[data.deck_id] || []), newCard]
        }
      }));
      
      // Сохраняем в кэш
      await saveDeckCards(data.deck_id, get().cards[data.deck_id]);
      console.log(`✅ Карточка создана локально`);
      return newCard;
    } catch (error) {
      console.error('❌ Ошибка создания:', error);
      throw error;
    }
  },

  // ⭐ ОБНОВЛЕНИЕ - только 1 PUT запрос
  updateCard: async (id: string, data: Partial<Card>) => {
    try {
      console.log(`📝 Обновляем карточку ${id}...`);
      const updated = await updateCardOnServer(id, data as any);
      
      // Находим deckId
      const state = get();
      let deckId = '';
      for (const [key, cards] of Object.entries(state.cards)) {
        if (cards.some(c => c.id === id)) {
          deckId = key;
          break;
        }
      }
      
      if (deckId) {
        // Обновляем локально
        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: state.cards[deckId].map(card =>
              card.id === id ? { ...card, ...updated } : card
            )
          }
        }));
        
        await saveDeckCards(deckId, get().cards[deckId]);
      }
      
      console.log(`✅ Карточка ${id} обновлена локально`);
      return updated;
    } catch (error) {
      console.error('❌ Ошибка обновления:', error);
      throw error;
    }
  },

  // ⭐ УДАЛЕНИЕ - только 1 DELETE запрос
  deleteCard: async (id: string, deckId: string) => {
    try {
      console.log(`🗑️ Удаляем карточку ${id}...`);
      await deleteCard(id);
      
      // Удаляем локально
      set((state) => ({
        cards: {
          ...state.cards,
          [deckId]: state.cards[deckId].filter(card => card.id !== id)
        }
      }));
      
      // Сохраняем в кэш
      await saveDeckCards(deckId, get().cards[deckId]);
      console.log(`✅ Карточка ${id} удалена локально`);
    } catch (error) {
      console.error('❌ Ошибка удаления:', error);
      throw error;
    }
  }
}));