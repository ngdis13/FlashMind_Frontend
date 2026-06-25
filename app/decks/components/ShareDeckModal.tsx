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
import { Logo } from "@/components/Logo"; // Ваша звездочка
import { colors } from "@/styles/Colors";
import { LogoCuteStar } from "@/components/LogoCuteStar";

interface ShareDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  // Меняем тип возвращаемого значения на Promise<boolean>, так как экран возвращает true/false
  onMakePublic: () => Promise<boolean> | boolean ; 
}

export const ShareDeckModal = ({
  visible,
  onClose,
  onCopyLink,
  onMakePublic,
}: ShareDeckModalProps) => {
  const [step, setStep] = useState<"private" | "moderation">("private");

  const handleMakePublicPress = async () => {
    try {
      // Дожидаемся ответа от функции на экране
      const isSuccess = await onMakePublic();
      
      // Переключаем шаг ТОЛЬКО если запрос прошел успешно (сервер ответил 200)
      if (isSuccess === true ) {
        setStep("moderation");
      }
    } catch (error) {
      console.error("Ошибка при публикации колоды внутри модалки:", error);
    }
  };

  const handleClose = () => {
    setStep("private"); // Сбрасываем шаг при закрытии
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
              {step === "private" ? (
                // --- ШАГ 1: ПРИВАТНЫЙ ДОСТУП ---
                <View style={{ width: "100%" }}>
                  {/* Анимация/Звездочка */}
                  <View style={styles.logoContainer}>
                    <LogoCuteStar size={140} />
                  </View>
                  <Typography variant="h1" style={styles.title}>
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
                    Сейчас колоду видишь только ты и те, с кем ты поделишься ссылкой
                  </Typography>

                  {/* Кнопка "Сделать публичной" */}
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
                  <Typography color={colors.darkGray} style={styles.hint}>
                    Колода появится в общем каталоге и будет доступна для поиска всем пользователям
                  </Typography>

                  {/* Кнопка "Отмена" */}
                  <Pressable onPress={handleClose} style={styles.cancelButton}>
                    <Typography color={colors.mainColor} variant="h2">
                      Отмена
                    </Typography>
                  </Pressable>
                </View>
              ) : (
                // --- ШАГ 2: ЭКРАН МОДЕРАЦИИ ---
                <View style={{ width: "100%", alignItems: "center" }}>
                  <View style={styles.logoContainer}>
                    <Logo size={140} />
                  </View>
                  <Typography variant="h2" style={styles.moderationText}>
                    Колода появится в общем поиске после проверки модератора
                  </Typography>

                  <MainButton title="Отлично" onPress={handleClose} />
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
    padding: 24,
    width: "90%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 8, // Добавили фиксированный отступ под логотип, чтобы заголовки не прилипали
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    textAlign: "left",
    marginTop: 6,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  moderationText: {
    textAlign: "center",
    marginBottom: 24, // Увеличили отступ перед синей кнопкой "Отлично" по макету
    lineHeight: 22,
    fontWeight: "500",
  },
  cancelButton: {
    alignSelf: "center",
    marginTop: 24,
    paddingVertical: 4,
  },
});
