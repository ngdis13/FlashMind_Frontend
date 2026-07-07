
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, Card} from '../types/types';
import { StoreCard } from '@/store/card.store';

export interface DeckCardsStorage {
  isActual: boolean;
  cards: StoreCard[]; 
}

// Ключи для разных типов данных
const STORAGE_KEYS = {
  DECKS: '@flashcards/decks',           // Все колоды
  DECK_CARDS: '@flashcards/deck_cards', // Карточки колод (будем хранить по ID)
};

/**
 * Сохранить все колоды в хранилище
 */
export const saveDecks = async (decks: Deck[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(decks);
    await AsyncStorage.setItem(STORAGE_KEYS.DECKS, jsonValue);
    console.log('Колоды сохранены в AsyncStorage');
  } catch (error) {
    console.error('Ошибка при сохранении колод:', error);
    throw error;
  }
};

/**
 * Загрузить все колоды из хранилища
 */
export const loadDecks = async (): Promise<Deck[] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.DECKS);
    if (jsonValue === null) {
      console.log('📭 В хранилище нет колод');
      return null;
    }
    const decks = JSON.parse(jsonValue);
    console.log(` Загружено ${decks.length} колод из хранилища`);
    return decks;
  } catch (error) {
    console.error(' Ошибка при загрузке колод:', error);
    return null;
  }
};

/**
 * Обновить одну конкретную колоду в хранилище
 */
export const updateSingleDeckInStorage = async (deckId: string, updatedFields: Partial<Deck>): Promise<Deck[]> => {
  try {
    const currentDecks = await loadDecks() || [];
    
    const updatedDecks = currentDecks.map(deck => {
      if (deck.id === deckId) {
        return { ...deck, ...updatedFields }; // Мержим старые поля с новыми
      }
      return deck;
    });

    await saveDecks(updatedDecks);
    return updatedDecks;
  } catch (error) {
    console.error('Ошибка при обновлении колоды в AsyncStorage:', error);
    throw error;
  }
};

/**
 * Сохранить карточки конкретной колоды ВМЕСТЕ с флагом актуальности
 */
export const saveDeckCards = async (deckId: string, storageData: DeckCardsStorage): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.DECK_CARDS}_${deckId}`;
    
    if (!storageData || typeof storageData.isActual !== 'boolean' || !Array.isArray(storageData.cards)) {
      throw new Error(`[Storage CRITICAL] Попытка записать неверный формат для колоды ${deckId}`);
    }

    const jsonValue = JSON.stringify(storageData);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`💾 Карточки колоды ${deckId} сохранены на диск.`);
  } catch (error) {
    console.error('Ошибка при сохранении карточек:', error);
    throw error;
  }
};
/**
 * Загрузить карточки конкретной колоды и статус их актуальности
 */
export const loadDeckCards = async (deckId: string): Promise<DeckCardsStorage | null> => {
  try {
    const key = `${STORAGE_KEYS.DECK_CARDS}_${deckId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) return null;
    
    const data = JSON.parse(jsonValue);
    
    // Вместо падения — мягкий сброс старого кэша (если на диске лежит старый формат массива)
    if (!data || typeof data.isActual !== 'boolean' || !Array.isArray(data.cards)) {
      console.log(`⚠️ На диске обнаружен старый формат для колоды ${deckId}. Сбрасываем кэш.`);
      await AsyncStorage.removeItem(key); // Чистим старый мусор автоматически!
      return null; // Стор поймет, что данных нет, и безопасно пойдет на сервер
    }

    return data as DeckCardsStorage;
  } catch (error) {
    console.error('Ошибка при загрузке карточек с диска:', error);
    return null;
  }
};

/**
 * Обновить карточку в колоде локально на диске
 */
export const updateCardInDeck = async (
  deckId: string, 
  cardId: string, 
  updates: Partial<StoreCard> // <-- Меняем на Partial<StoreCard>
): Promise<DeckCardsStorage | null> => {
  try {
    const storageData = await loadDeckCards(deckId);
    if (!storageData) return null;
    
    const updatedCards = storageData.cards.map(card => 
      card.id === cardId ? { ...card, ...updates } as StoreCard : card
    );
    
    const newState: DeckCardsStorage = {
      isActual: true,
      cards: updatedCards
    };
    
    await saveDeckCards(deckId, newState);
    return newState;
  } catch (error) {
    console.error('Ошибка при обновлении карточки на диске:', error);
    return null;
  }
};

/**
 * Очистить все данные (для отладки)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const flashcardKeys = keys.filter(key => key.startsWith('@flashcards/'));
    await AsyncStorage.multiRemove(flashcardKeys);
    console.log('Все данные очищены');
  } catch (error) {
    console.error('Ошибка при очистке:', error);
  }
};


