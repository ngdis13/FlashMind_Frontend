// components/InfoStudy.tsx
import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";
import { InfoModalLayout } from "@/components/InfoModal";

interface InfoStudyProps {
  visible: boolean;
  onCancel: () => void;
}

export const InfoStudy = ({ visible, onCancel }: InfoStudyProps) => {
  return (
    <InfoModalLayout
      visible={visible}
      onClose={onCancel}
      containerStyle={{ padding: 20, gap: 20, width: "90%" }}
    >
      {/* Верхнее описание параметров */}
      <View style={styles.headerInfo}>
                <Typography variant="h3" style={styles.paragraph}>
                  <Typography variant="h3" style={styles.boldText}>
                    Целевое запоминание
                  </Typography>{" "}
                  — вероятность вспомнить карточку при повторении. Чем выше %,
                  тем чаще алгоритм возвращает карточки и тем выше нагрузка на
                  обучение.
                </Typography>

                <Typography variant="h3" style={styles.paragraph}>
                  <Typography variant="h3" style={styles.boldText}>
                    Максимальный интервал
                  </Typography>{" "}
                  — самый долгий перерыв перед повторением уже хорошо изученного слова.
                </Typography>
              </View>

              {/* Секция: Режимы обучения */}
              <View style={styles.modesSection}>
                <Typography
                  variant="h3"
                  style={[styles.boldText, { marginBottom: 12 }]}
                >
                  Режимы обучения:
                </Typography>

                {/* Режим: Лайт */}
                <View style={styles.modeRow}>
                  <View style={[styles.dot, { backgroundColor: "#95E16F" }]} />
                  <Typography variant="h3" style={styles.modeText}>
                    <Typography variant="h3" style={styles.boldText}>
                      Лайт
                    </Typography>{" "}
                    — карточки повторяются реже. Подходит для долгосрочного
                    обучения (например, изучения языков) и поддержания знаний.
                  </Typography>
                </View>

                {/* Режим: Баланс */}
                <View style={styles.modeRow}>
                  <View style={[styles.dot, { backgroundColor: "#FFDC51" }]} />
                  <Typography variant="h3" style={styles.modeText}>
                    <Typography variant="h3" style={styles.boldText}>
                      Баланс
                    </Typography>{" "}
                    — стандартный режим интервального повторения.
                  </Typography>
                </View>

                {/* Режим: Интенсив */}
                <View style={styles.modeRow}>
                  <View style={[styles.dot, { backgroundColor: "#FB8B93" }]} />
                  <Typography variant="h3" style={styles.modeText}>
                    <Typography variant="h3" style={styles.boldText}>
                      Интенсив
                    </Typography>{" "}
                    — частые повторения для быстрой подготовки в короткий срок.
                  </Typography>
                </View>
              </View>

              {/* Нижняя подсказка  */}
              <View style={styles.hintContainer}>
                <Typography variant="h3" style={styles.hintText}>
                  💡 Вы можете выбрать готовый режим или настроить ползунки
                  вручную под себя.
                </Typography>
              </View>

              {/* Кнопка действия */}
              <View style={styles.buttonContainer}>
                <MainButton
                  title="Понятно"
                  onPress={onCancel}
                  style={styles.button}
                />
      </View>
    </InfoModalLayout>
  );
};

const styles = StyleSheet.create({
  headerInfo: {
    gap: 16,
  },
  paragraph: {
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700", // Выделение ключевых слов жирным
  },
  modesSection: {
    width: "100%",
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    width: "100%",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
    marginTop: 3, 
  },
  modeText: {
    flex: 1,
    lineHeight: 18,
  },
  hintContainer: {
    backgroundColor: "#F2F2F7", 
    padding: 10,
    borderRadius: 12,
  },
  hintText: {
    lineHeight: 18,
    color: "#3A3A3C",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 4,
  },
  button: {
    width: "100%",
  },
});
