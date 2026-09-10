// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet } from "react-native";

// --------------------------- Компоненты ---------------------------
import { InfoModalLayout } from "@/components/InfoModal";
import { MainButton } from "@/components/MainButton";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { LogoSadStar } from "@/components/LogoSadStar";

// --------------------------- Типы ---------------------------
export interface InsufficientReviewsData {
  error: string;
  message: string;
  remaining_reviews: number;
  total_reviews: number;
}

interface AiModalProps {
  visible: boolean;
  onClose: () => void;
  data?: InsufficientReviewsData | null;
}

/**
 * Модалка «Недостаточно данных» — показывается при 422 от API.
 */
export const AiModal = ({ visible, onClose, data }: AiModalProps) => {
  const done = data?.total_reviews ?? 0;
  const remaining = data?.remaining_reviews ?? 0;
  const target = done + remaining;
  const percent = target > 0 ? Math.round((done / target) * 100) : 0;

  return (
    <InfoModalLayout
      visible={visible}
      onClose={onClose}
      containerStyle={styles.modalContainer}
    >
      <LogoSadStar size={140}  style={{marginBottom: 16}}/>

      <Typography variant="h2" style={styles.title}>
        Нейросети нужно больше данных!
      </Typography>

      <Typography variant="h3" style={styles.message}>
        Повтори ещё {remaining} карточек, чтобы алгоритм смог рассчитать твой точный прогноз и выявить скрытые суперсилы.
      </Typography>

      {/* Прогресс-бар */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Typography variant="h3" style={styles.progressText}>
          {done} из {target} повторений
        </Typography>
      </View>

      <MainButton title="Хорошо" onPress={onClose} />
    </InfoModalLayout>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: "85%",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    color: colors.darkGray,
    lineHeight: 18,
    marginBottom: 20
  },
  title: {
    marginBottom: 8
  },
  progressWrap: {
    width: "100%",
    gap: 8,
    marginBottom: 16
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(106, 90, 224, 0.12)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 2
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.mainColor,
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    color: colors.darkGray,
    fontSize: 10
  },
});
