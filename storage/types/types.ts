// Единый источник правды по блокам — конструктор карточек.
import { CardBlock } from "@/feature/decks/deck-create-card/types/cardBlocks";

export type { CardBlock };

/**
 * Информация о облачной синхронизации колоды
 */
export interface CloudInfo {
  is_approved: boolean;
  is_cloud_deck: boolean;
  needs_sync: boolean;
  cloud_deck_id?: string | null; // null = автор удалил колоду из облака
  cloud_type?: "PUBLIC" | "PRIVATE"; // может отсутствовать
  is_author?: boolean; // может отсутствовать
  author_id?: string; // может отсутствовать
}

// Добавьте этот тип в начало файла или в types.ts
export interface CloudDeckShareResponse {
  cloud_uuid: string;
  status: string;
  sync_stats: {
    added: number;
    deleted: number;
    updated: number;
  };
  type: string;
}

export interface CloudDeckImportResponse {
    added: number; // Количество добавленных карточек
  deck_id: string; // ID созданной/обновленной колоды
  cloud_uuid: string;
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
  deck_id: string;
  title: string; // обязателен, уникален в рамках колоды
  front: CardBlock[];
  back: CardBlock[];
  hint1?: string | null; // подсказка или null
  hint2?: string | null; // подсказка или null
  difficulty?: number; // FSRS-параметр
  stability?: number; // FSRS-параметр
  in_learning: boolean; // карточка в процессе обучения
  card_template_id?: string | null;
  created_at?: string; // ISO 8601
  is_suspended?: boolean; // отложенная карточка (не попадает в due-список)
}


/**
 * Одна запись из истории ревью карточки (v2.0.0)
 */
export interface ReviewHistoryEntry {
  review_datetime: string; // ISO 8601
  rating: 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
  difficulty: number; // сложность после ревью
  stability: number; // стабильность после ревью
  review_duration_ms: number; // длительность ревью в мс
}


/**
 * Расширенный ответ GET /cards/{card_id} (v2.0.0).
 */
export interface CardDetailResponse {
  card: Card;
  last_review_datetime: string | null; // null, если ревью не было
  next_review_datetime: string | null; // null, если ревью не было
  review_history: ReviewHistoryEntry[]; // отсортирован по дате asc; для новых карточек — []
}

export interface DeckCardsStorage {
  isActual: boolean;
  cards: Card[];
}

/**
 * Колода 
 */
export interface Deck {
  id: string;
  name: string;
  description: string;
  total_cards: number;
  repeat_cards: number;
  settings: DeckSettings;
  cloud_info: CloudInfo;
  cards_on_study?: Card[]; //  карточки на обучение на сегодня (user-decks, PUT decks)

  extraCount?: number;
  cards?: Card[]; 
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
export interface CardsResponse {
  cards: Card[];
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
 * Payload для создания карточки (POST /api/v1/flashmind/cards) — v2.0.0.
 * title обязателен и уникален в рамках колоды 
 */
export interface CreateCardPayload {
  deck_id: string;
  title: string;
  front: CardBlock[];
  back: CardBlock[];
  hint1?: string | null;
  hint2?: string | null;
}


/**
 * Payload для частичного обновления карточки (PUT /api/v1/flashmind/cards/{card_id}) — v2.0.0.
 * Все поля опциональны: передаются ТОЛЬКО изменяемые поля,
 * не переданные (null/отсутствующие) остаются без изменений.
 */
export interface UpdateCardPayload {
  title?: string;
  front?: CardBlock[];
  back?: CardBlock[];
  hint1?: string | null;
  hint2?: string | null;
  is_suspended?: boolean;
}
