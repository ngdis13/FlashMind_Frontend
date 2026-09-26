
import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import type { QuizBlock } from "../../types/cardBlocks";
import type { PreviewBlockContext } from "./types";

interface QuizPreviewProps {
  block: QuizBlock;
  context: PreviewBlockContext;
}

// Интерактивное превью quiz-блока: до проверки варианты выбираются тапом,
// после «Проверить» верные зелёные, выбранные ошибочные — красные
export const QuizPreview: React.FC<QuizPreviewProps> = ({ block, context }) => {
  const { quizSelections, checkedQuizIds, onToggleQuizOption } = context;

  // Показываем только заполненные варианты
  const filled = block.variants
    .map((text, index) => ({ text, index }))
    .filter((v) => v.text.trim());

  const isChecked = checkedQuizIds.includes(block.id);
  const isSelected = (index: number) =>
    (quizSelections[block.id] ?? []).includes(index);

  if (filled.length === 0) {
    return (
      <Typography variant="h3" style={styles.placeholderText}>
        [Варианты не заполнены]
      </Typography>
    );
  }

  return (
    <View style={styles.list}>
      {filled.map(({ text, index }) => {
        const isCorrect = block.correctIndexes.includes(index);

        // Базовый стиль всегда применяем, вариант накладывается поверх —
        // иначе теряются borderRadius и паддинги
        const optionStyles: ViewStyle[] = [styles.option];
        if (!isChecked && isSelected(index))
          optionStyles.push(styles.optionSelected);
        if (isChecked && isCorrect) optionStyles.push(styles.optionCorrect);
        if (isChecked && !isCorrect && isSelected(index))
          optionStyles.push(styles.optionWrong);

        // На заливке (выбор/верный/неверный) текст белый — как в обучении
        const isFilled =
          (!isChecked && isSelected(index)) ||
          (isChecked && (isCorrect || isSelected(index)));
        const optionTextStyles: TextStyle[] = [styles.optionText];
        if (isFilled) optionTextStyles.push(styles.optionTextLight);

        return (
          <Pressable
            key={index}
            style={optionStyles}
            onPress={() => !isChecked && onToggleQuizOption(block.id, index)}
          >
            <Typography variant="h3" style={optionTextStyles}>
              {text}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { gap: 12, width: "100%" },
  option: {
    // Без обводки — drop shadow из макета: X0 Y0 Blur5, #000 15%
    borderRadius: 15,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  optionSelected: {
    // Сплошная заливка выбора — насыщеннее light2MainColor,
    // чтобы было видно на белом фоне карточки
    borderColor: "#A9AFFF",
    backgroundColor: "#A9AFFF",
  },
  optionCorrect: {
    borderColor: "#7ED88F",
    backgroundColor: "#7ED88F",
  },
  optionWrong: {
    borderColor: "#F87171",
    backgroundColor: "#F87171",
  },
  optionText: { color: "#1E1F4B", fontSize: 16 },
  optionTextLight: { color: colors.white },
  placeholderText: {
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
  },
});
