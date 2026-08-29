import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck } from '../types/types';
import { StoreCard } from '@/store/card.store';

/**
 * Версия формата дискового кэша.
 * v1 — карточки с front/back как HTML-строки (до API 2.0.0)
 * v2 — карточки с front/back как JSON-блоки (API 2.0.0)
 * При несовпадении версии кэш мягко сбрасывается (см. loadDecks/loadDeckCards).
 */
export const STORAGE_VERSION = 2;

export interface DeckCardsStorage {
  version: number; // Версия формата (миграция при несовпадении)
  isActual: boolean;
  cards: StoreCard[];
}

// Новый строгий тип для дискового кэша колод
export interface DecksStorageState {
  version: number; // Версия формата (миграция при несовпадении)
  isActual: boolean; // Булевый флаг актуальности
  expiresAt: number; // Timestamp (в мс) автоматического сброса кэша
  decks: Deck[]; // Массив самих колод
}

// Ключи для разных типов данных
const STORAGE_KEYS = {
  DECKS: '@flashcards/decks', // Все колоды
  DECK_CARDS: '@flashcards/deck_cards', // Карточки колод (хранятся по ID колоды)
};

/**
 * Сохранить все колоды в хранилище ВМЕСТЕ с флагами актуальности и времени
 */
export const saveDecks = async (storageData: DecksStorageState): Promise<void> => {
  try {
    // Жесткая проверка структуры перед записью на диск
    if (
      !storageData ||
      storageData.version !== STORAGE_VERSION ||
      typeof storageData.isActual !== 'boolean' ||
      typeof storageData.expiresAt !== 'number' ||
      !Array.isArray(storageData.decks)
    ) {
      throw new Error('[Storage CRITICAL] Попытка записать неверный формат структуры колод на диск!');
    }

    const jsonValue = JSON.stringify(storageData);
    await AsyncStorage.setItem(STORAGE_KEYS.DECKS, jsonValue);
    console.log(`💾 [Storage] Список колод сохранен на диск. Количество: ${storageData.decks.length} шт. Флаг: ${storageData.isActual}`);
  } catch (error) {
    console.error('Ошибка при сохранении колод в AsyncStorage:', error);
    throw error;
  }
};

/**
 * Загрузить все колоды из хранилища вместе с метаданными
 */
export const loadDecks = async (): Promise<DecksStorageState | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.DECKS);
    if (jsonValue === null) {
      console.log('📭 [Storage] В хранилище нет данных по колодам');
      return null;
    }

    const data = JSON.parse(jsonValue);

    // Валидация структуры при чтении с диска:
    // старый формат / другая версия / поврежденные данные — мягко сбрасываем кэш
    if (
      !data ||
      data.version !== STORAGE_VERSION ||
      typeof data.isActual !== 'boolean' ||
      typeof data.expiresAt !== 'number' ||
      !Array.isArray(data.decks)
    ) {
      console.log('⚠️ [Storage] На диске кэш старого формата/версии. Сбрасываем (миграция на API 2.0.0)...');
      await AsyncStorage.removeItem(STORAGE_KEYS.DECKS); // Чистим старый мусор
      return null; // Стор безопасно пойдет делать GET-запрос к API
    }

    console.log(`📦 [Storage] Успешно загружено ${data.decks.length} колод с диска. Актуальность: ${data.isActual}`);
    return data as DecksStorageState;
  } catch (error) {
    console.error('Ошибка при загрузке колод из AsyncStorage:', error);
    return null;
  }
};

/**
 * Обновить одну конкретную колоду в хранилище на диске
 */
export const updateSingleDeckInStorage = async (deckId: string, updatedFields: Partial<Deck>): Promise<Deck[]> => {
  try {
    const currentStorageState = await loadDecks();

    // Если данных на диске почему-то нет, возвращаем пустой массив
    if (!currentStorageState) return [];

    // Мержим старые поля колоды с новыми
    const updatedDecks = currentStorageState.decks.map(deck => {
      if (deck.id === deckId) {
        return { ...deck, ...updatedFields };
      }
      return deck;
    });

    // Сохраняем обратно всю структуру, удерживая старые флаги актуальности и времени
    const newStorageState: DecksStorageState = {
      ...currentStorageState,
      decks: updatedDecks
    };

    await saveDecks(newStorageState);
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

    if (
      !storageData ||
      storageData.version !== STORAGE_VERSION ||
      typeof storageData.isActual !== 'boolean' ||
      !Array.isArray(storageData.cards)
    ) {
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

    // Мягкий сброс старого кэша (старый формат массива или другая версия)
    if (
      !data ||
      data.version !== STORAGE_VERSION ||
      typeof data.isActual !== 'boolean' ||
      !Array.isArray(data.cards)
    ) {
      console.log(`⚠️ Кэш карточек колоды ${deckId} старого формата/версии. Сбрасываем...`);
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
  updates: Partial<StoreCard>
): Promise<DeckCardsStorage | null> => {
  try {
    const storageData = await loadDeckCards(deckId);
    if (!storageData) return null;

    const updatedCards = storageData.cards.map(card =>
      card.id === cardId ? { ...card, ...updates } as StoreCard : card
    );

    const newState: DeckCardsStorage = {
      version: STORAGE_VERSION,
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
    const ourKeys = keys.filter(key =>
      key.startsWith('@flashcards/') || key === '@profile'
    );
    await AsyncStorage.multiRemove(ourKeys);
    console.log('Все данные очищены');
  } catch (error) {
    console.error('Ошибка при очистке:', error);
  }
};
