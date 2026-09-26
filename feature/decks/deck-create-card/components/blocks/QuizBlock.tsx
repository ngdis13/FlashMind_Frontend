import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

interface QuizBlockProps {
  variants: string[];
  correctIndexes: number[];
}

export const QuizBlock: React.FC<QuizBlockProps> = ({
  variants,
  correctIndexes,
}) => {
  return (
    <View style={styles.content}>
      {variants.map((variant, index) => {
        const isCorrect = correctIndexes.includes(index);
        return (
          <View key={index} style={styles.row}>
            <View style={[styles.radio, isCorrect && styles.radioSelected]}>
              {isCorrect && (
                <Typography variant="span" style={styles.check}>
                  ✓
                </Typography>
              )}
            </View>
            <Typography variant="h3" style={styles.text} numberOfLines={1}>
              {variant || "Пустой вариант"}
            </Typography>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.mainColor,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: colors.mainColor,
  },
  check: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 14,
  },
  text: {
    flex: 1,
    color: colors.darkGray,
  },
});
