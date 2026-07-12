import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Pressable,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { colors } from "@/styles/Colors";
import { LogoCuteStar } from "@/components/LogoCuteStar";

interface ShareDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onMakePublic: () => Promise<boolean> | boolean;
  isAuthor?: boolean; // ✅ Добавляем флаг
}

export const ShareDeckModal = ({
  visible,
  onClose,
  onCopyLink,
  onMakePublic,
  isAuthor = false, // По умолчанию false
}: ShareDeckModalProps) => {
  const [step, setStep] = useState<"private" | "moderation">("private");

  const handleMakePublicPress = async () => {
    try {
      const isSuccess = await onMakePublic();
      if (isSuccess === true) {
        setStep("moderation");
      }
    } catch (error) {
      console.error("Ошибка при публикации колоды внутри модалки:", error);
    }
  };

  const handleClose = () => {
    setStep("private");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {isAuthor ? (
                // ✅ ДЛЯ АВТОРА - полный функционал
                step === "private" ? (
                  // ШАГ 1: Приватный доступ
                  <View style={{ width: "100%" }}>
                    <View style={styles.logoContainer}>
                      <LogoCuteStar size={140} />
                    </View>
                    <Typography variant="h2" style={styles.title}>
                      Доступ к колоде
                    </Typography>

                    <SecondButton
                      title="Скопировать ссылку"
                      onPress={onCopyLink}
                      icon={
                        <Image
                          source={require("@/feature-decks/assets/IconLink.png")}
                          style={{ width: 20, height: 20 }}
                        />
                      }
                    />
                    <Typography color={colors.darkGray} style={styles.hint}>
                      Сейчас колоду видишь только ты и те, с кем ты поделишься
                      ссылкой
                    </Typography>

                    <View style={{ marginTop: 16 }}>
                      <MainButton
                        title="Сделать публичной"
                        onPress={handleMakePublicPress}
                        icon={
                          <Image
                            source={require("@/feature-decks/assets/IconPlanet.png")}
                            style={{ width: 16, height: 16 }}
                          />
                        }
                      />
                    </View>
                    <Typography variant="h3"  color={colors.darkGray} style={styles.hint}>
                      Колода появится в общем каталоге и будет доступна для
                      поиска всем пользователям
                    </Typography>

                    <Pressable
                      onPress={handleClose}
                      style={styles.cancelButton}
                    >
                      <Typography color={colors.mainColor} variant="h2">
                        Отмена
                      </Typography>
                    </Pressable>
                  </View>
                ) : (
                  // ШАГ 2: Модерация
                  <View style={{ width: "100%", alignItems: "center" }}>
                    <View style={styles.logoContainer}>
                      <LogoCuteStar size={140} />
                    </View>
                    <Typography variant="h2" style={styles.moderationText}>
                      Колода появится в общем поиске после проверки модератора
                    </Typography>

                    <MainButton title="Отлично" onPress={handleClose} />
                  </View>
                )
              ) : (
                // ✅ ДЛЯ ПОЛЬЗОВАТЕЛЯ (НЕ АВТОРА) - упрощенный вариант
                <View style={{ width: "100%" }}>
                  <View style={styles.logoContainer}>
                    <LogoCuteStar size={140} />
                  </View>
                  <Typography variant="h2" style={styles.title2}>
                    Доступ к колоде
                  </Typography>
                  <Typography
                    variant="h3"
                    color={colors.darkGray}
                    style={styles.hint2}
                  >
                    Это ссылка на оригинальную версию автора. Карточки и
                    изменения, которые ты добавишь лично для себя, в неё не
                    попадут.
                  </Typography>

                  <SecondButton
                    title="Скопировать ссылку"
                    onPress={onCopyLink}
                    icon={
                      <Image
                        source={require("@/feature-decks/assets/IconLink.png")}
                        style={{ width: 20, height: 20 }}
                      />
                    }
                  />

                  <Pressable onPress={handleClose} style={styles.cancelButton}>
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
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: 370,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  title2: {
    textAlign: "center",
    marginBottom: 8,
  },
  hint: {
    textAlign: "left",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  hint2: {
    textAlign: "center",
    paddingBottom: 16,
    width: 340
  },
  moderationText: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: "500",
  },
  cancelButton: {
    alignSelf: "center",
    marginTop: 24,
    paddingVertical: 4,
  },
});
