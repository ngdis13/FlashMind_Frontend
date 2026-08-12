// --------------------------- React ---------------------------
import React, { useMemo } from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet } from "react-native";

// --------------------------- Стили & Графика ---------------------------
import { Typography } from "@/styles/Typography";
import { Logo } from "@/components/Logo";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";

interface ClosedProps {
  data: {
    analysis_next_date: string;
  };
  onBack: () => void;
}

/** Вычисляет оставшееся время до следующего отчета */
const getTimeRemaining = (nextDateStr: string): string => {
  const now = new Date();
  const next = new Date(nextDateStr);
  const diff = next.getTime() - now.getTime();

  if (diff <= 0) return "менее минуты";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}`);
  if (hours > 0) parts.push(`${hours} ч`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} мин`);

  return parts.join(" ");
};

export const Closed = ({ data, onBack }: ClosedProps) => {
  const timeLeft = useMemo(() => getTimeRemaining(data.analysis_next_date), [data.analysis_next_date]);

  return (
    <View style={styles.container}>
      <View style={styles.characterWrapper}>
        <Logo size={240} />
      </View>

      <View style={styles.contentBlock}>
        <Typography variant="span" style={styles.mainTitle}>
          Отличный разбор!
        </Typography>

        <Typography variant="span" style={styles.bodyText}>
          План на неделю готов — время качать супер-память. Жду тебя на следующем ИИ-анализе через {timeLeft}!
        </Typography>
      </View>

      <View style={styles.bottomBlock}>
        <MainButton title="До встречи!" onPress={onBack} style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingBottom: 30,
    justifyContent: "center",
    alignItems: "center",
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
    position: "absolute",
    bottom: 30,
    width: "100%",
    paddingHorizontal: 12,
  },
  button: {
    width: "100%",
  },
});
