
import { create } from "zustand";
import { fetchUserDecks, updateDeck, deleteDeckOnServer } from "@/storage/api/api";
import { loadDecks, saveDecks } from "@/storage/service/decksStorage";
import { Deck } from "@/storage/types/types";

type DeckState = {
  decks: Deck[];
  isLoading: boolean;
  error: string | null;
  fetchDecks: (force?: boolean) => Promise<void>;
  getDeckById: (id: string) => Deck | undefined;
  updateDeck: (id: string, data: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
};

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  isLoading: false,
  error: null,

  // ⭐ ГЛАВНЫЙ МЕТОД - с кэшированием
  fetchDecks: async (force = false) => {
    const state = get();
    
    // Если уже есть данные - используем кэш
    if (!force && state.decks.length > 0) {
      console.log('📦 Колоды уже загружены, использую кэш');
      return;
    }

    // Защита от дублирующихся запросов
    if (state.isLoading) {
      console.log('⏳ Запрос уже выполняется');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Сначала проверяем AsyncStorage
      const cached = await loadDecks();
      if (cached && cached.length > 0 && !force) {
        console.log(`📦 Загружено ${cached.length} колод из кэша`);
        set({ decks: cached, isLoading: false });
        return;
      }

      // Если кэша нет - запрос к серверу
      console.log('🌐 Загружаем колоды с сервера...');
      const serverDecks = await fetchUserDecks();
      await saveDecks(serverDecks);
      set({ decks: serverDecks, isLoading: false });
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

  // ⭐ ОБНОВЛЕНИЕ - с локальным обновлением
  updateDeck: async (id: string, data: Partial<Deck>) => {
    try {
      console.log(`📝 Обновляем колоду ${id}...`);
      await updateDeck(id, data);
      
      // Обновляем локально
      set((state) => ({
        decks: state.decks.map(deck =>
          deck.id === id ? { ...deck, ...data } : deck
        )
      }));
      
      // Сохраняем в кэш
      await saveDecks(get().decks);
      console.log(`✅ Колода ${id} обновлена локально`);
    } catch (error) {
      console.error('❌ Ошибка обновления:', error);
      throw error;
    }
  },

  // ⭐ УДАЛЕНИЕ - с локальным обновлением
  deleteDeck: async (id: string) => {
    try {
      console.log(`🗑️ Удаляем колоду ${id}...`);
      await deleteDeckOnServer(id);
      
      // Удаляем локально
      set((state) => ({
        decks: state.decks.filter(deck => deck.id !== id)
      }));
      
      // Сохраняем в кэш
      await saveDecks(get().decks);
      console.log(`✅ Колода ${id} удалена локально`);
    } catch (error) {
      console.error('❌ Ошибка удаления:', error);
      throw error;
    }
  }
}));