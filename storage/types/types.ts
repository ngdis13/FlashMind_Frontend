// src/types.ts

/**
 * Информация о облачной синхронизации колоды
 */
export interface CloudInfo {
  is_approved: boolean;
  is_cloud_deck: boolean;
  needs_sync: boolean;
  cloud_deck_id?: string; // может отсутствовать у обычных колод
  cloud_type?: "PUBLIC" | "PRIVATE"; // может отсутствовать
  is_author?: boolean; // может отсутствовать
  author_id?: string; // может отсутствовать
}

// Добавьте этот тип в начало файла или в types.ts
export interface CloudDeckShareResponse {
  cloud_uid: string;
  status: string;
  sync_stats: {
    added: number;
    deleted: number;
    updated: number;
  };
  type: string;
}

export interface CloudDeckImportResponse {
  cloud_uid: string;
  deck_name: string;
  deck_description?: string;
  cards: Card[];
  sync_stats?: {
    last_synced_at: string;
    version: number;
  };
}

/**
 * Настройки колоды
 */
export interface DeckSettings {
  color: string;
  desired_retention: number;
  maximum_interval: number;
}

/**
 * Карточка - одна карточка в колоде
 * (добавил поля, которые могут быть в ответе, но документация их не показывает)
 */
export interface Card {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  created_at?: string; // опционально, если есть
  updated_at?: string; // опционально, если есть
  difficulty?: number; // опционально, если есть
  stability?: number; // опционально, если есть
  // Добавь другие поля, если они есть в реальном ответе
}

/**
 * Колода - соответствует ответу от сервера (новое API)
 */
export interface Deck {
  id: string;
  name: string;
  description: string;
  total_cards: number;
  repeat_cards: number;
  settings: DeckSettings; // ✅ все настройки внутри settings
  cloud_info: CloudInfo; // ✅ новая структура
  // Дополнительные поля для UI (не приходят с сервера)
  extraCount?: number; // для UI
  cards?: Card[]; // для UI (кешированные карточки)
}

/**
 * Ответ от сервера при получении всех колод
 */
export interface DecksResponse {
  decks: Deck[];
  cloud_info?: CloudInfo; // ✅ в документации есть cloud_info на верхнем уровне
}

/**
 * Ответ от сервера при получении карточек колоды
 */
export interface CardsResponse {
  cards: Card[];
  page?: number; // если пагинация
  per_page?: number; // если пагинация
  total?: number; // если пагинация
}

/**
 * Payload для создания колоды (POST /api/v1/decks)
 */
export interface CreateDeckPayload {
  name: string;
  description: string;
  color: string;
}

/**
 * Payload для обновления колоды (PUT /api/v1/decks/{deck_id})
 */
export interface UpdateDeckPayload {
  name: string;
  description: string;
  desired_retention: number;
  maximum_interval: number;
  color: string;
}

/**
 * Payload для создания карточки (POST /api/v1/cards)
 */
export interface CreateCardPayload {
  deck_id: string;
  front: string;
  back: string;
}

/**
 * Payload для обновления карточки (PUT /api/v1/cards/{card_id})
 */
export interface UpdateCardPayload {
  front: string;
  back: string;
}
