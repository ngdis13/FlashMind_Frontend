
import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { MainButton } from "@/components/MainButton";
import { PreviewBlock } from "@/feature-decks/deck-create-card/components/preview/PreviewBlock";
import type { PreviewBlockContext } from "@/feature-decks/deck-create-card/components/preview/types";
import type { CardBlock } from "@/feature-decks/deck-create-card/types/cardBlocks";

interface StudyBlocksViewProps {
  blocks: CardBlock[] | undefined;
}

// Рендер блоков стороны карточки в обучении — тот же реестр превью,
// что и в предпросмотре: текст/картинка/интерактивный quiz
export const StudyBlocksView: React.FC<StudyBlocksViewProps> = ({ blocks }) => {
  const [quizSelections, setQuizSelections] = useState<
    Record<string, number[]>
  >({});
  const [checkedQuizIds, setCheckedQuizIds] = useState<string[]>([]);

  // Клик по варианту quiz-блока — toggle (верных может быть несколько)
  const handleToggleQuizOption = (blockId: string, index: number): void => {
    setQuizSelections((prev) => {
      const current = prev[blockId] ?? [];
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [blockId]: next };
    });
  };

  // «Проверить» — фиксирует результат для всех quiz-блоков стороны
  const handleCheck = (): void => {
    const ids = (blocks ?? [])
      .filter((b) => b.type === "quiz")
      .map((b) => b.id);
    setCheckedQuizIds((prev) => [...new Set([...prev, ...ids])]);
  };

  const hasQuiz = (blocks ?? []).some((b) => b.type === "quiz");
  const isAllChecked = (blocks ?? [])
    .filter((b) => b.type === "quiz")
    .every((b) => checkedQuizIds.includes(b.id));

  // Контекст, который получают все блоки превью
  const context = useMemo<PreviewBlockContext>(
    () => ({
      quizSelections,
      checkedQuizIds,
      onToggleQuizOption: handleToggleQuizOption,
    }),
    [quizSelections, checkedQuizIds],
  );

  return (
    <View style={styles.wrapper}>
      {(blocks ?? []).map((block) => (
        <PreviewBlock key={block.id} block={block} context={context} />
      ))}

      {/* Кнопка «Проверить» — видна всегда, после проверки неактивна */}
      {hasQuiz && (
        <View style={styles.checkWrapper}>
          <MainButton
            style={{ width: "100%" }}
            title="Проверить"
            onPress={handleCheck}
            disabled={isAllChecked}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%", gap: 16 },
  checkWrapper: { marginTop: 4 },
});
