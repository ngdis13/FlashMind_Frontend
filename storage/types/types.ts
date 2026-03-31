// src/types.ts

/**
 * Карточка - одна карточка в колоде
 */
export interface Card {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

/**
 * Колода - соответствует ответу от сервера
 */
export interface Deck {
  id: string;
  name: string;           // ← у вас name, не title
  description: string;
  total_cards: number;    // ← у вас total_cards, не cardCount
  extraCount?: number;    // ← добавим отдельно для вашего UI (23 на скриншоте)
  cards?: Card[];         // ← карточки подгрузятся позже
  created_at?: string;
  updated_at?: string;
}

/**
 * Ответ от сервера при получении всех колод
 */
export interface DecksResponse {
  decks: Deck[];
}

/**
 * Ответ от сервера при получении карточек колоды
 */
export interface DeckCardsResponse {
  cards: Card[];
}