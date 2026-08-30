import { CardBlock } from "@/feature/decks/deck-create-card/types/cardBlocks";

export interface CloudAuthor {
  avatar_url: string;
  bio: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

export interface CloudPreviewCard {
  id: string;
  title: string;
  front: CardBlock[];
  back: CardBlock[];
}

export interface CloudDeckPreviewResponse {
  author: CloudAuthor;
  cards: CloudPreviewCard[];
  description: string;
  downloaded: number;
  id: string;
  last_synced_at: string;
  name: string;
  total_cards: number;
}


export interface CloudDeckItem {
  id: string;
  name: string;
  description: string;
  total_cards: number;
  downloaded: number;
  last_synced_at: string;
  author: {
    user_id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export interface FetchCloudDecksResponse {
  decks: CloudDeckItem[];
}

