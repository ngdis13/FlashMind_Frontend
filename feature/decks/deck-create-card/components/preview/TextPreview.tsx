
import React from "react";
import { StyleSheet } from "react-native";
import { Typography } from "@/styles/Typography";
import { HtmlText } from "../HtmlText";
import { CARD_DISPLAY } from "@/styles/CardDisplay";
import { useCardScale } from "@/utils/hooks/useCardScale";
import type { TermBlock, TextBlock } from "../../types/cardBlocks";
import type { PreviewBlockContext } from "./types";

interface TextPreviewProps {
  block: TermBlock | TextBlock;
  context: PreviewBlockContext; 
}

// Статичное превью term/text: HTML из Lexical или заглушка
export const TextPreview: React.FC<TextPreviewProps> = ({ block }) => {
  const { textScale, scaledText } = useCardScale();

  return block.value ? (
    <HtmlText
      html={block.value}
      fontSize={scaledText(CARD_DISPLAY.fontSize)}
      scale={textScale}
    />
  ) : (
    <Typography variant="h2" style={styles.placeholderText}>
      {block.type === "term" ? "Пустой термин" : "Пустой текст"}
    </Typography>
  );
};

const styles = StyleSheet.create({
  placeholderText: {
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
  },
});
