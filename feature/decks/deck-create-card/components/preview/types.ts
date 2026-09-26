// Общий контекст интерактивного превью. Модалка владеет состоянием,

export interface PreviewBlockContext {
  /** Выбранные варианты по quiz-блокам: { [blockId]: индексы вариантов } */
  quizSelections: Record<string, number[]>;
  /** Quiz-блоки, которые уже проверили */
  checkedQuizIds: string[];
  /** Клик по варианту quiz-блока (toggle) */
  onToggleQuizOption: (blockId: string, index: number) => void;
}
