// components/InfoStudy.tsx
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";
import { InfoModalLayout } from "@/components/InfoModal";
import { AppEmojis } from "@/assets/emoji/emoji";

interface InfoPutOffProps {
  visible: boolean;
  onCancel: () => void;
}

export const InfoPutOff = ({ visible, onCancel }: InfoPutOffProps) => {
  return (
    <InfoModalLayout
      visible={visible}
      onClose={onCancel}
      containerStyle={{ padding: 20, width: "90%", alignItems: "flex-start"  }}
    >
      <Typography variant="h3" style={[styles.headerText]}>
        Отложить карточку {""}
        <Image source={AppEmojis.hourglass} style={styles.inlineEmoji} />
      </Typography>

      <Typography variant="h3" style={styles.modeText}>
        Полностью исключает карточку из обучения. Алгоритм перестанет засылать
        её на повторение до тех пор, пока вы вручную не включите её обратно на
        этом экране
      </Typography>

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
  headerText: {
    fontWeight: "700", // Выделение ключевых слов жирным
    marginBottom: 16
  },
  button: {
    width: "100%",
  },
  inlineEmoji: {
    width: 12,
    height: 12,
  },
  modeText: {
    flex: 1,
    lineHeight: 18,
    marginBottom: 24
  },
});
