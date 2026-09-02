// Универсальный рендер HTML-содержимого блока (термин/текст).
// Значения блоков — HTML из Lexical-редактора, а этот компонент —
// зеркало Editor.css: что видно при редактировании, то и на рендере
// (обучение, превью, облачная карточка — везде через этот компонент).
import React from "react";
import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";

import { colors } from "@/styles/Colors";

interface HtmlTextProps {
  html: string;
  /** Базовый размер шрифта (по умолчанию 18 — как в редакторе) */
  fontSize?: number;
  color?: string;
  align?: "left" | "center";
}

const SYSTEM_FONTS = [
  "Montserrat",
  "MontserratRegular",
  "MontserratMedium",
  "MontserratSemiBold",
  "MontserratBold",
  "CourierPrime",
];

// Цвет текста в редакторе (.editor-input из Editor.css)
const EDITOR_TEXT_COLOR = "#1E1F4B";

export const HtmlText: React.FC<HtmlTextProps> = ({
  html,
  fontSize = 18, // было 16 — в редакторе 18px
  color = EDITOR_TEXT_COLOR, // был серый darkGray
  align = "left",
}) => {
  const { width } = useWindowDimensions();

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      systemFonts={SYSTEM_FONTS}
      // База = .editor-input: Montserrat 18px, line-height 1.6, #1E1F4B
      baseStyle={{
        fontFamily: "MontserratRegular", // был MontserratMedium
        fontSize,
        lineHeight: Math.round(fontSize * 1.6),
        color,
        textAlign: align,
      }}
      // Зеркало классов .editor-* из Editor.css.
      // ВАЖНО: шрифты зарегистрированы отдельными семействами — вес
      // задаём ТОЛЬКО через fontFamily, fontWeight не сработает!
      tagsStyles={{
        p: { margin: 0, padding: 0 },
        b: { fontFamily: "MontserratBold", fontWeight: "400" },
        strong: { fontFamily: "MontserratBold", fontWeight: "400" },
        i: { fontStyle: "italic" },
        em: { fontStyle: "italic" },
        u: { textDecorationLine: "underline" },
        s: { textDecorationLine: "line-through" },
        strike: { textDecorationLine: "line-through" },
        code: {
          fontFamily: "CourierPrime",
          backgroundColor: "#F4F4F9",
          fontSize: 16,
          borderRadius: 4,
        },
        h1: {
          fontFamily: "MontserratBold",
          fontWeight: "400",
          fontSize: 24,
          color: "#1E1F4B",
          marginVertical: 12,
        },
        h2: {
          fontFamily: "MontserratBold",
          fontWeight: "400",
          fontSize: 20,
          color: "#1E1F4B",
          marginVertical: 10,
        },
        h3: {
          fontFamily: "MontserratSemiBold",
          fontWeight: "400",
          fontSize: 18,
          color: "#1E1F4B",
          marginVertical: 8,
        },
        ul: { paddingLeft: 22, marginVertical: 8 },
        ol: { paddingLeft: 22, marginVertical: 8 },
        li: { marginVertical: 2 },
        blockquote: {
          borderLeftWidth: 4,
          borderColor: "#DDDDDD",
          paddingLeft: 12,
          marginVertical: 8,
          color: "#55556E",
        },
        a: { color: colors.mainColor },
      }}
    />
  );
};
