// Универсальный рендер HTML-содержимого блока (термин/текст).
// Значения блоков сохраняются как HTML из Lexical-редактора
// (https://github.com/seranking-planable/react-native-lexical),
// поэтому везде, где блок показывается пользователю (превью, карточка),
// его нужно рендерить через этот компонент, а не как plain text.
import React from "react";
import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";

import { colors } from "@/styles/Colors";

interface HtmlTextProps {
  html: string;
  /** Базовый размер шрифта (заголовки считаются относительно него) */
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

export const HtmlText: React.FC<HtmlTextProps> = ({
  html,
  fontSize = 16,
  color = colors.darkGray,
  align = "left",
}) => {
  const { width } = useWindowDimensions();

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      systemFonts={SYSTEM_FONTS}
      baseStyle={{
        fontFamily: "MontserratMedium",
        fontSize,
        color,
        textAlign: align,
      }}
      tagsStyles={{
        p: { margin: 0 },
        h1: {
          fontSize: fontSize + 8,
          fontWeight: "700",
          color: "#1E1F4B",
          marginVertical: 6,
        },
        h2: {
          fontSize: fontSize + 4,
          fontWeight: "700",
          color: "#1E1F4B",
          marginVertical: 5,
        },
        h3: {
          fontSize: fontSize + 2,
          fontWeight: "600",
          color: "#1E1F4B",
          marginVertical: 4,
        },
        ul: { paddingHorizontal: 20, marginVertical: 4 },
        ol: { paddingHorizontal: 20, marginVertical: 4 },
        li: { marginBottom: 2 },
        code: { fontFamily: "CourierPrime", backgroundColor: "#F4F4F9" },
        a: { color: colors.mainColor },
      }}
    />
  );
};
