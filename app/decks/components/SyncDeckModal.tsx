import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { LogoSurprisedStar } from "@/components/LogoSurprised";
import { colors } from "@/styles/Colors";

interface SyncDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onSync: () => Promise<void> | void;
  type: "author_updated" | "user_updated";
}

export const SyncDeckModal = ({
  visible,
  onClose,
  onSync,
  type,
}: SyncDeckModalProps) => {
  const isAuthorUpdated = type === "author_updated";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Иконка звездочки */}
              <View style={styles.logoContainer}>
                <LogoSurprisedStar size={150} />
              </View>

              {isAuthorUpdated ? (
                // === ЛЕВЫЙ МАКЕТ: АВТОР ВНЕС ИЗМЕНЕНИЯ ===
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Typography variant="h2" style={[styles.title, {marginBottom: 2, width: 348}]}>
                    Кажется, автор колоды внес изменения!
                  </Typography>
                  <Typography variant="h2" style={styles.title}>
                    Хочешь добавить их к себе?
                  </Typography>

                  <View style={styles.bulletContainer}>
                    <Typography
                      color={colors.darkGray}
                      style={styles.bulletText}
                    >
                      ✨ Появятся новые карточки и обновится то, что вы еще не
                      начали изучать
                    </Typography>
                    <Typography
                      color={colors.darkGray}
                      style={styles.bulletText}
                    >
                      ✅ Ваш прогресс и созданные вами карточки внутри этой
                      колоды не изменятся
                    </Typography>
                  </View>

                  <MainButton title="Синхронизировать" onPress={onSync} />

                  <Pressable onPress={onClose} style={styles.cancelButton}>
                    <Typography color={colors.mainColor} variant="h2">
                      Оставить как есть
                    </Typography>
                  </Pressable>
                </View>
              ) : (
                // === ПРАВЫЙ МАКЕТ: ПОЛЬЗОВАТЕЛЬ ОБНОВИЛ ГЛОБАЛЬНУЮ КОЛОДУ ===
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Typography variant="h2" style={styles.title}>
                    Ты обновил свою колоду!{"\n"}Хочешь сохранить изменения в
                    облаке?
                  </Typography>

                  <Typography
                    variant="h3"
                    color={colors.darkGray}
                    style={styles.descriptionText}
                  >
                    Остальные пользователи увидят обновленную версию колоды
                  </Typography>

                  <MainButton title="Синхронизировать" onPress={onSync} />

                  <Pressable onPress={onClose} style={styles.cancelButton}>
                    <Typography color={colors.mainColor} variant="h2">
                      Отмена
                    </Typography>
                  </Pressable>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    width: "100%",
    minHeight: 490,
    maxWidth: 373,
    borderColor: colors.lightGray,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    width: "100%",
  },
  bulletContainer: {
    width: "100%",
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "left",
  },
  descriptionText: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
