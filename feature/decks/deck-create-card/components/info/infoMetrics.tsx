// components/InfoStudy.tsx
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";
import { InfoModalLayout } from "@/components/InfoModal";
import { AppEmojis } from "@/assets/emoji/emoji";

interface InfoMetricsProps {
  visible: boolean;
  onCancel: () => void;
}

export const InfoMetrics = ({ visible, onCancel }: InfoMetricsProps) => {
  return (
    <InfoModalLayout
      visible={visible}
      onClose={onCancel}
      containerStyle={{ padding: 20, width: "90%", alignItems: "flex-start" }}
    >
      <View style={styles.headerBox}>
        <Typography variant="h3" style={[styles.headerText]}>
          Текущие метрики {""}
          <Image source={AppEmojis.barChart} style={styles.inlineEmoji} />
        </Typography>

        <Typography variant="h3" style={styles.modeText}>
          Здесь ты можешь увидеть краткую сводку прогресса по карточке
        </Typography>
      </View>

      <View style={styles.mainInfoBox}>
        <Typography variant="h3" style={[styles.boldText]}>
          Что означает каждая метрика:
        </Typography>

        <Typography variant="h3" style={styles.modeText}>
          <Image source={AppEmojis.fire} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Сложность: {""}
          </Typography>
          Показывает, насколько тяжело это слово дается вашей памяти (от 1 до
          10). Чем выше балл, тем чаще алгоритм будет возвращать карточку на
          проверку, чтобы вы её не забыли.
        </Typography>

        <Typography variant="h3" style={styles.modeText}>
          <Image source={AppEmojis.lightning} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Cтабильность: {""}
          </Typography>
          «Запас прочности» воспоминания в днях. Показывает, через сколько дней
          вероятность вспомнить это слово упадет до 90%. Чем выше цифра, тем
          реже нужно повторять карточку.
        </Typography>

        <Typography variant="h3" style={styles.modeText}>
          <Image source={AppEmojis.hourglass} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Дата повтора: {""}
          </Typography>
          Точные даты, когда вы повторяли карточку в прошлый раз и когда
          алгоритм FSRS запланировал следующий показ, чтобы закрепить её в
          памяти.
        </Typography>

        <Typography variant="h3" style={styles.modeText}>
          <Image source={AppEmojis.clock} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Время изучения: {""}
          </Typography>
          Общее время в минутах и секундах, которое вы потратили на просмотр и
          обдумывание этой карточки за все сессии обучения.
        </Typography>
      </View>

      {/* Кнопка действия */}
      <View style={styles.buttonContainer}>
        <MainButton title="Понятно" onPress={onCancel} style={styles.button} />
      </View>
    </InfoModalLayout>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
  },
  headerBox: { marginBottom: 12 },
  headerText: {
    fontWeight: "700", // Выделение ключевых слов жирным
    marginBottom: 16,
  },
  mainInfoBox: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    width: "100%",
  },
  boldText: {
    fontWeight: "700",
  },
  inlineEmoji: {
    width: 12,
    height: 12,
  },
  modeText: {
    flex: 1,
    lineHeight: 18,
  },
});
