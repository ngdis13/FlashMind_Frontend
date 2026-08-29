import { CardBlock } from "@/storage/types/types";

/**
 * Превращает массив блоков карточки в plain text
 * (для поиска и превью в списках — быстро, без рендера HTML).
 * HTML внутри text/term-блоков (из Lexical) очищается от тегов.
 */
export const blocksToPlainText = (blocks: CardBlock[] | undefined): string => {
  if (!blocks || blocks.length === 0) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "term":
        case "text":
          return stripHtml(block.value);
        case "quiz":
          return block.variants.join(" · ");
        case "image":
          return ""; // картинки в текстовый поиск/превью не попадают
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Убирает HTML-теги, оставляя чистый текст (+ декодирует HTML-сущности)
 */
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(div|p|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&/gi, "&")
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/"/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
};
