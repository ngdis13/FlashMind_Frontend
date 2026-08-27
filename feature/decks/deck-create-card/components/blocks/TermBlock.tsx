// feature-decks/deck-create-card/components/blocks/TermBlock.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { HtmlText } from "../HtmlText";

interface TermBlockProps {
  value: string;
}

export const TermBlock: React.FC<TermBlockProps> = ({ value }) => {
  return (
    <View style={styles.content}>
      {value ? (
        <HtmlText html={value} />
      ) : (
        <Typography variant="h3" style={styles.placeholder}>
          Нажмите на карандаш, чтобы редактировать...
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    minHeight: 50,
    justifyContent: "center",
  },
  placeholder: {
    color: colors.darkGray,
    fontStyle: "italic",
  },
});
