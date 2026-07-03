// store/deck.store.ts
import { create } from "zustand";
import { fetchUserDecks, updateDeck, deleteDeckOnServer } from "@/storage/api/api";
import { loadDecks, saveDecks } from "@/storage/service/decksStorage";
import { Deck } from "@/storage/types/types";

type DeckState = {
  decks: Deck[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  needsRefresh: boolean;
  
  fetchDecks: (force?: boolean) => Promise<void>;
  getDeckById: (id: string) => Deck | undefined;
  updateDeck: (id: string, data: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  setNeedsRefresh: (value: boolean) => void;
};

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  needsRefresh: false,

  setNeedsRefresh: (value: boolean) => {
    set({ needsRefresh: value });
  },

  fetchDecks: async (force = false) => {
    const state = get();
    
    if (!force && state.decks.length > 0) {
      console.log('📦 Колоды уже загружены, использую кэш');
      return;
    }

    if (state.isLoading) {
      console.log('⏳ Запрос уже выполняется');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const cached = await loadDecks();
      if (cached && cached.length > 0 && !force) {
        console.log(`📦 Загружено ${cached.length} колод из кэша`);
        set({ decks: cached, isLoading: false, lastFetched: Date.now() });
        return;
      }

      console.log('🌐 Загружаем колоды с сервера...');
      const serverDecks = await fetchUserDecks();
      
      // ✅ Сохраняем ВСЕ поля
      await saveDecks(serverDecks);
      set({ 
        decks: serverDecks, 
        isLoading: false, 
        lastFetched: Date.now(),
        needsRefresh: false // Сбрасываем флаг
      });
      
      console.log(`✅ Загружено ${serverDecks.length} колод с сервера`);
    } catch (error) {
      console.error('❌ Ошибка загрузки колод:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки',
        isLoading: false 
      });
    }
  },

  getDeckById: (id: string) => {
    return get().decks.find(d => d.id === id);
  },

  updateDeck: async (id: string, data: Partial<Deck>) => {
    try {
      console.log(`📝 Обновляем колоду ${id}...`);
      await updateDeck(id, data);
      
      set((state) => ({
        decks: state.decks.map(deck =>
          deck.id === id ? { ...deck, ...data } : deck
        )
      }));
      
      await saveDecks(get().decks);
      console.log(`✅ Колода ${id} обновлена локально`);
    } catch (error) {
      console.error('❌ Ошибка обновления:', error);
      throw error;
    }
  },

  deleteDeck: async (id: string) => {
    try {
      console.log(`🗑️ Удаляем колоду ${id}...`);
      await deleteDeckOnServer(id);
      
      set((state) => ({
        decks: state.decks.filter(deck => deck.id !== id)
      }));
      
      await saveDecks(get().decks);
      console.log(`✅ Колода ${id} удалена локально`);
    } catch (error) {
      console.error('❌ Ошибка удаления:', error);
      throw error;
    }
  }
}));