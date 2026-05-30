// src/types.ts

/**
 * Карточка - одна карточка в колоде
 */
export interface Card {
  id: string;
  front: string;
  back: string;
  created_at: string;
}

export interface DeckSettings {
  color: string;
  desired_retention: number;
  maximum_interval: number;
}

/**
 * Колода - соответствует ответу от сервера
 */
export interface Deck {
  id: string;
  name: string; 
  color: string;
  repeat_cards: number;
  settings: DeckSettings,
  description: string;
  total_cards: number; 
  extraCount?: number; 
  cards?: Card[];
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
