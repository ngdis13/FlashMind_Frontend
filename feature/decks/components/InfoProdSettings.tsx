// components/InfoStudy.tsx
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";
import { InfoModalLayout } from "@/components/InfoModal";
import { AppEmojis } from "@/assets/emoji/emoji";

interface InfoProdSettingsProps {
  visible: boolean;
  onCancel: () => void;
}

export const InfoProdSettings = ({
  visible,
  onCancel,
}: InfoProdSettingsProps) => {
  return (
    <InfoModalLayout
      visible={visible}
      onClose={onCancel}
      containerStyle={{ padding: 20, width: "90%", alignItems: "flex-start" }}
    >
      <Typography variant="h3" style={[styles.headerText]}>
        Продвинутые настройки {""}
        <Image source={AppEmojis.gear} style={styles.inlineEmoji} />
      </Typography>
      {/* Верхнее описание параметров */}
      <View style={styles.infoBox}>
        <Typography variant="h3" style={styles.paragraph}>
          <Image source={AppEmojis.newBadge} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Новых карточек в день
          </Typography>{" "}
          — ограничивает количество карточек, которые вы начнете учить за день.
          Помогает дозировать нагрузку и защищает от выгорания.
        </Typography>

        <Typography variant="h3" style={styles.paragraph}>
          <Image source={AppEmojis.shield} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Дневной лимит
          </Typography>{" "}
          — задает максимальный потолок карточек на день. Если старых повторов
          слишком много, приложение автоматически отключит новые карточки, чтобы
          защитить вас от выгорания.
        </Typography>

        <Typography variant="h3" style={styles.paragraph}>
          <Image source={AppEmojis.chartUp} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Целевое запоминание
          </Typography>{" "}
          — вероятность вспомнить карточку при повторении. Чем выше %, тем чаще
          алгоритм возвращает карточки и тем выше нагрузка на обучение.
        </Typography>

        <Typography variant="h3" style={styles.paragraph}>
          <Image source={AppEmojis.hourglass} style={styles.inlineEmoji} />{" "}
          <Typography variant="h3" style={styles.boldText}>
            Максимальный интервал
          </Typography>{" "}
          — самый долгий перерыв перед повторением уже хорошо изученного слова.
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
  infoBox: {
    gap: 12,
    marginBottom: 24,
  },
  paragraph: {
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700", // Выделение ключевых слов жирным
  },
  headerText: {
    fontWeight: "700", // Выделение ключевых слов жирным
    marginBottom: 16,
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
  inlineEmoji: {
    width: 12,
    height: 12,
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
    justifyContent: "center",
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
