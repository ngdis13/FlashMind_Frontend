import { CardBlock } from "@/storage/types/types";

/**
 * Собирает HTML из массива блоков карточки (для рендера через HtmlText).
 * Значения text/term-блоков — уже HTML из Lexical, склеиваем по порядку position.
 */
export const blocksToHtml = (blocks: CardBlock[] | undefined): string => {
  if (!blocks || blocks.length === 0) return "";

  return [...blocks]
    .sort((a, b) => a.position - b.position)
    .map((block) => {
      switch (block.type) {
        case "term":
        case "text":
          return block.value || "";
        case "image":
          return `<img src="${block.url}" style="max-width:100%;" />`;
        case "quiz":
          return `<p>${block.variants
            .map((v, i) => (i === block.correctIndex ? `✅ ${v}` : `• ${v}`))
            .join("<br/>")}</p>`;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("");
};
