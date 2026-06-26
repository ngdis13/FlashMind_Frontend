export interface CloudAuthor {
  avatar_key: string;
  bio: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

export interface CloudPreviewCard {
  front: string;
  id: string;
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
