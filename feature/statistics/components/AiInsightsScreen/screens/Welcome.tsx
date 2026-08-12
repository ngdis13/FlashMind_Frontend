// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet, Image } from "react-native";

// --------------------------- Стили & Графика ---------------------------
import { Typography } from "@/styles/Typography";
import { AppEmojis } from "@/assets/emoji/emoji";
import { Logo } from "@/components/Logo";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";

interface WelcomeProps {
  data: {
    analysis_date: string;
  };
  onNext: () => void;
}

export const Welcome = ({ data, onNext }: WelcomeProps) => {
  const formattedDate = new Date(data.analysis_date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  return (
    <View style={styles.container}>
      {/* 1. ПРИВЕТСТВЕННАЯ ПЕЧЕНЬКА-ЗВЕЗДОЧКА (По центру) */}
      <View style={styles.characterWrapper}>
        <Logo size={240} />
      </View>

      {/* 2. КОНТЕНТНЫЙ БЛОК (Заголовок + текст) */}
      <View style={styles.contentBlock}>
        <Typography variant="span" style={styles.mainTitle}>
          Твой отчет готов! <Image source={AppEmojis.rocket} style={styles.inlineEmoji} />
        </Typography>

        <Typography variant="span" style={styles.bodyText}>
          Мы собрали твои главные взлеты, нашли проблемные зоны и составили план на эту неделю
        </Typography>
      </View>

      {/* 3. БЛОК С ДАТОЙ И КНОПКОЙ (Фиксированный снизу) */}
      <View style={styles.bottomBlock}>
        <Typography variant="h3" style={styles.bottomDate}>
          Обновлено: {formattedDate}
        </Typography>
        
        <MainButton title="Погнали!" onPress={onNext} style={styles.button} />
      </View>
    </View>
  );
};

// --------------------------- Системные Стили по твоему макету ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingBottom: 30, // Стандартный BOTTOM_MARGIN
    justifyContent: "center", // Центрируем всё по вертикали
    alignItems: "center",
    marginTop: 70
  },
  characterWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentBlock: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  mainTitle: {
    fontSize: 22,
    textAlign: "center",
  },
  bodyText: {
    lineHeight: 18,
    color: colors.darkGray,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  bottomBlock: {
    width: "100%",
    alignItems: "center",
    gap: 16, 
    marginTop: "auto", 
  },
  bottomDate: {
    color: colors.darkGray,
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    width: "100%",
  },
  inlineEmoji: {
    width: 20,
    height: 20,
  },
});