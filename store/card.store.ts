
import { create } from "zustand";
import { 
  fetchDeckCards, 
  createCard, 
  updateCardOnServer, 
  deleteCard,
  fetchCardById
} from "@/storage/api/api";
import { loadDeckCards, saveDeckCards } from "@/storage/service/decksStorage";
import { Card } from "@/storage/types/types";

type CardState = {
  cards: Record<string, Card[]>; // { deckId: [cards] }
  isLoading: Record<string, boolean>;
  error: string | null;
  lastFetched: Record<string, number>;
  
  fetchCards: (deckId: string, force?: boolean) => Promise<void>;
  getCards: (deckId: string) => Card[];
  getCardById: (cardId: string) => Promise<Card | null>;  // ← НОВЫЙ МЕТОД
  createCard: (data: { deck_id: string; front: string; back: string }) => Promise<Card>;
  updateCard: (id: string, data: Partial<Card>) => Promise<Card>;
  deleteCard: (id: string, deckId: string) => Promise<void>;
  clearCards: (deckId?: string) => void;
};

export const useCardStore = create<CardState>((set, get) => ({
  cards: {},
  isLoading: {},
  error: null,
  lastFetched: {},

  // ============================================
  // ⭐ ПОЛУЧАЕМ УРЕЗАННЫЕ КАРТОЧКИ КОЛОДЫ
  // ============================================
  fetchCards: async (deckId: string, force = false) => {
    // Если уже есть карточки - используем кэш
    if (!force && get().cards[deckId] && get().cards[deckId].length > 0) {
      console.log(`📦 Карточки для колоды ${deckId} уже загружены (${get().cards[deckId].length} шт.)`);
      return;
    }

    if (get().isLoading[deckId]) {
      console.log(`⏳ Запрос карточек для ${deckId} уже выполняется`);
      return;
    }

    set((state) => ({ 
      isLoading: { ...state.isLoading, [deckId]: true },
      error: null 
    }));

    try {
      // Проверяем AsyncStorage
      const cached = await loadDeckCards(deckId);
      if (cached && cached.length > 0 && !force) {
        console.log(`📦 Использую кэш: ${cached.length} карточек`);
        set((state) => ({
          cards: { ...state.cards, [deckId]: cached },
          isLoading: { ...state.isLoading, [deckId]: false }
        }));
        return;
      }

      // Запрос к серверу (урезанные данные)
      console.log(`🌐 Загружаем карточки для ${deckId} с сервера...`);
      const serverCards = await fetchDeckCards(deckId);
      console.log(`📥 Получено ${serverCards?.length || 0} карточек с сервера (урезанные)`);
      
      if (serverCards && serverCards.length > 0) {
        await saveDeckCards(deckId, serverCards);
      }
      
      set((state) => ({
        cards: { ...state.cards, [deckId]: serverCards || [] },
        isLoading: { ...state.isLoading, [deckId]: false },
        lastFetched: { ...state.lastFetched, [deckId]: Date.now() }
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

  // ============================================
  // ⭐ ПОЛУЧАЕМ ПОЛНУЮ КАРТОЧКУ ПО ID
  // ============================================
  getCardById: async (cardId: string): Promise<Card | null> => {
    console.log(`🔍 getCardById: ${cardId}`);
    
    // 1️⃣ Ищем в кэше (сначала во всех колодах)
    const allCards = Object.values(get().cards).flat();
    const found = allCards.find(c => c.id === cardId);
    
    if (found) {
      console.log(`✅ Карточка найдена в кэше: ${found.front}`);
      // ✅ Проверяем, есть ли back (если нет - нужно загрузить полную версию)
      if (found.back) {
        console.log(`📦 Полная карточка с back: ${found.back.substring(0, 30)}...`);
        return found;
      } else {
        console.log(`⚠️ Карточка в кэше без back, загружаем полную версию...`);
        // Продолжаем к запросу на сервер
      }
    } else {
      console.log(`❌ Карточка ${cardId} не найдена в кэше`);
    }

    // 2️⃣ Если нет в кэше или нет back - загружаем с сервера
    try {
      console.log(`🌐 Загружаем ПОЛНУЮ карточку ${cardId} с сервера...`);
      const fullCard = await fetchCardById(cardId);
      console.log(`✅ Полная карточка загружена:`, {
        id: fullCard.id,
        front: fullCard.front,
        hasBack: !!fullCard.back
      });
      
      // 3️⃣ Обновляем кэш с полной карточкой
      // Находим в какой колоде эта карточка
      let deckId = '';
      for (const [key, cards] of Object.entries(get().cards)) {
        if (cards.some(c => c.id === cardId)) {
          deckId = key;
          break;
        }
      }
      
      if (deckId) {
        console.log(`📦 Обновляем карточку в кэше колоды ${deckId}`);
        // Обновляем карточку в кэше
        const updatedCards = get().cards[deckId].map(c => 
          c.id === cardId ? { ...c, ...fullCard } : c
        );
        
        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: updatedCards
          }
        }));
        // Сохраняем в AsyncStorage
        await saveDeckCards(deckId, updatedCards);
        console.log(`💾 Обновлена карточка в кэше для колоды ${deckId}`);
      } else {
        // Если колода не найдена - просто добавляем карточку в отдельный кэш
        console.log(`⚠️ Колода для карточки ${cardId} не найдена, сохраняем отдельно`);
        // Здесь можно добавить логику для сохранения отдельной карточки
      }
      
      return fullCard;
    } catch (error) {
      console.error(`❌ Ошибка загрузки карточки ${cardId}:`, error);
      return null;
    }
  },

  // ============================================
  // CRUD операции
  // ============================================
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
      
      await saveDeckCards(data.deck_id, get().cards[data.deck_id]);
      console.log(`✅ Карточка создана локально`);
      return newCard;
    } catch (error) {
      console.error('❌ Ошибка создания:', error);
      throw error;
    }
  },

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

  deleteCard: async (id: string, deckId: string) => {
    try {
      console.log(`🗑️ Удаляем карточку ${id}...`);
      await deleteCard(id);
      
      set((state) => ({
        cards: {
          ...state.cards,
          [deckId]: state.cards[deckId].filter(card => card.id !== id)
        }
      }));
      
      await saveDeckCards(deckId, get().cards[deckId]);
      console.log(`✅ Карточка ${id} удалена локально`);
    } catch (error) {
      console.error('❌ Ошибка удаления:', error);
      throw error;
    }
  },

  clearCards: (deckId?: string) => {
    if (deckId) {
      set((state) => ({
        cards: { ...state.cards, [deckId]: [] },
        lastFetched: { ...state.lastFetched, [deckId]: undefined }
      }));
    } else {
      set({ cards: {}, lastFetched: {} });
    }
  }
}));