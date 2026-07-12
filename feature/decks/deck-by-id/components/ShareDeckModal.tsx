// --------------------------- React ---------------------------
import React, { useState } from "react";

// --------------------------- React Native ---------------------------
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Pressable,
} from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { LogoCuteStar } from "@/components/LogoCuteStar";

/**
 * Пропсы для компонента ShareDeckModal
 * @interface ShareDeckModalProps
 * @property {boolean} visible - Управляет видимостью модального окна
 * @property {() => void} onClose - Колбэк при закрытии модального окна
 * @property {() => void} onCopyLink - Колбэк при копировании ссылки
 * @property {() => Promise<boolean> | boolean} onMakePublic - Колбэк при публикации колоды
 * @property {boolean} [isAuthor] - Флаг, является ли пользователь автором колоды
 */
interface ShareDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onMakePublic: () => Promise<boolean> | boolean;
  isAuthor?: boolean;
}

/**
 * Компонент модального окна для управления доступом к колоде
 * 
 * @component
 * @param {ShareDeckModalProps} props - Свойства компонента
 * @param {boolean} props.visible - Управляет видимостью модального окна
 * @param {() => void} props.onClose - Колбэк при закрытии модального окна
 * @param {() => void} props.onCopyLink - Колбэк при копировании ссылки
 * @param {() => Promise<boolean> | boolean} props.onMakePublic - Колбэк при публикации колоды
 * @param {boolean} [props.isAuthor=false] - Флаг автора колоды
 * @returns {JSX.Element} React компонент модального окна шаринга
 * 
 * @description
 * Компонент отображает модальное окно с двумя режимами:
 * 
 * Для автора колоды:
 * - Шаг 1: Копирование ссылки или публикация в каталог
 * - Шаг 2: Ожидание модерации после публикации
 * 
 * Для пользователя (не автора):
 * - Упрощенный режим с только копированием ссылки
 * - Информация о том, что изменения не синхронизируются с оригиналом
 * 
 * @example
 * // Для автора колоды
 * <ShareDeckModal
 *   visible={isShareModalVisible}
 *   onClose={() => setIsShareModalVisible(false)}
 *   onCopyLink={handleCopyLink}
 *   onMakePublic={handleMakePublic}
 *   isAuthor={true}
 * />
 * 
 * @example
 * // Для пользователя (не автора)
 * <ShareDeckModal
 *   visible={isShareModalVisible}
 *   onClose={() => setIsShareModalVisible(false)}
 *   onCopyLink={handleCopyLink}
 *   onMakePublic={handleMakePublic}
 *   isAuthor={false}
 * />
 */
export const ShareDeckModal = ({
  visible,
  onClose,
  onCopyLink,
  onMakePublic,
  isAuthor = false,
}: ShareDeckModalProps) => {
  // --------------------------- Состояния ---------------------------
  /**
   * Текущий шаг модального окна для автора
   * - "private": приватный доступ (шаг 1)
   * - "moderation": ожидание модерации (шаг 2)
   */
  const [step, setStep] = useState<"private" | "moderation">("private");

  // --------------------------- Обработчики ---------------------------
  /**
   * Обрабатывает нажатие на кнопку публикации колоды
   * При успешной публикации переключает на шаг модерации
   * @async
   */
  const handleMakePublicPress = async (): Promise<void> => {
    try {
      const isSuccess = await onMakePublic();
      if (isSuccess === true) {
        setStep("moderation");
      }
    } catch (error) {
      console.error("Ошибка при публикации колоды внутри модалки:", error);
    }
  };

  /**
   * Закрывает модальное окно и сбрасывает шаг на "private"
   */
  const handleClose = (): void => {
    setStep("private");
    onClose();
  };

  // --------------------------- Отрисовка ---------------------------
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

// --------------------------- Стили ---------------------------
/**
 * Стили для компонента ShareDeckModal
 * @constant
 */
const styles = StyleSheet.create({
  /**
   * Стиль полупрозрачного фона, перекрывающего весь экран
   */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  /**
   * Стиль контейнера модального окна
   */
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
  /**
   * Стиль контейнера для логотипа
   */
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  /**
   * Стиль заголовка для автора
   */
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  /**
   * Стиль заголовка для пользователя (не автора)
   */
  title2: {
    textAlign: "center",
    marginBottom: 8,
  },
  /**
   * Стиль подсказки (выравнивание по левому краю)
   */
  hint: {
    textAlign: "left",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  /**
   * Стиль подсказки для пользователя (выравнивание по центру)
   */
  hint2: {
    textAlign: "center",
    paddingBottom: 16,
    width: 340
  },
  /**
   * Стиль текста на шаге модерации
   */
  moderationText: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: "500",
  },
  /**
   * Стиль кнопки отмены
   */
  cancelButton: {
    alignSelf: "center",
    marginTop: 24,
    paddingVertical: 4,
  },
});