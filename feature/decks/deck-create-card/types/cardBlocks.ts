// Типы блоков карточки, повторяющие структуру бэкенда

export type CardBlockType = "term" | "text" | "quiz" | "image";

interface BaseBlock {
  id: string;
  position: number;
}

export interface TermBlock extends BaseBlock {
  type: "term";
  value: string;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  value: string;
}

export interface QuizBlock extends BaseBlock {
  type: "quiz";
  variants: string[];
  correctIndex: number;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
}

export type CardBlock = TermBlock | TextBlock | QuizBlock | ImageBlock;

export interface CreateCardPayload {
  card_id?: string;
  deck_id: string;
  title: string;
  front: CardBlock[];
  back: CardBlock[];
  hint1: string[];
  hint2: string[];
}
