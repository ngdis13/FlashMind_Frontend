// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, Card } from '../types/types';

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
 * Сохранить карточки конкретной колоды
 */
export const saveDeckCards = async (deckId: string, cards: Card[]): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.DECK_CARDS}_${deckId}`;
    const jsonValue = JSON.stringify(cards);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`Карточки колоды ${deckId} сохранены (${cards.length} шт.)`);
  } catch (error) {
    console.error('Ошибка при сохранении карточек:', error);
    throw error;
  }
};

/**
 * Загрузить карточки конкретной колоды
 */
export const loadDeckCards = async (deckId: string): Promise<Card[] | null> => {
  try {
    const key = `${STORAGE_KEYS.DECK_CARDS}_${deckId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) {
      console.log(`📭 В хранилище нет карточек для колоды ${deckId}`);
      return null;
    }
    const cards = JSON.parse(jsonValue);
    console.log(`Загружено ${cards.length} карточек для колоды ${deckId}`);
    return cards;
  } catch (error) {
    console.error('Ошибка при загрузке карточек:', error);
    return null;
  }
};

/**
 * Обновить карточку в колоде 
 */
export const updateCardInDeck = async (
  deckId: string, 
  cardId: string, 
  updates: Partial<Card>
): Promise<Card[] | null> => {
  try {
    const cards = await loadDeckCards(deckId);
    if (!cards) return null;
    
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    );
    
    await saveDeckCards(deckId, updatedCards);
    return updatedCards;
  } catch (error) {
    console.error('Ошибка при обновлении карточки:', error);
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