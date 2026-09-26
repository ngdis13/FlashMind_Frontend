import React from "react";
import type { CardBlock, CardBlockType } from "../../types/cardBlocks";
import type { PreviewBlockContext } from "./types";
import { TextPreview } from "./TextPreview";
import { ImagePreview } from "./ImagePreview";
import { QuizPreview } from "./QuizPreview";

/**
 * Реестр превью: тип блока → компонент.
 * Новый блок в превью = создать компонент в preview/ и добавить одну строку сюда.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBlockPreview = React.FC<{ block: any; context: PreviewBlockContext }>;

// Каждому типу блока — свой компонент с точным типом блока.
// Cast безопасен: тип блока и компонент в реестре всегда совпадают.
const PREVIEW_REGISTRY: Record<CardBlockType, AnyBlockPreview> = {
  term: TextPreview as unknown as AnyBlockPreview,
  text: TextPreview as unknown as AnyBlockPreview,
  image: ImagePreview as unknown as AnyBlockPreview,
  quiz: QuizPreview as unknown as AnyBlockPreview,
};

interface PreviewBlockProps {
  block: CardBlock;
  context: PreviewBlockContext;
}

// Диспетчер: подбирает компонент превью по типу блока
export const PreviewBlock: React.FC<PreviewBlockProps> = ({
  block,
  context,
}) => {
  const Component = PREVIEW_REGISTRY[block.type];
  return <Component block={block} context={context} />;
};
