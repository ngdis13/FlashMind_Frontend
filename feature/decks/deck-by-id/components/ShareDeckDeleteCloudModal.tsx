// --------------------------- React ---------------------------
import React, { useState, useEffect, useRef } from "react";

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

// --------------------------- Сторонние библиотеки ---------------------------
import Toast from "react-native-toast-message";
import { LogoSadStar } from "@/components/LogoSadStar";
import { LogoHappyStar } from "@/components/LogoHappyStar";
import { LogoCuteStar } from "@/components/LogoCuteStar";

// --------------------------- API и Store ---------------------------
import { takeOwnershipApi } from "@/storage/api/api";
import { useDeckStore } from "@/store/deck.store";
import { Logo } from "@/components/Logo";

/**
 * Пропсы для компонента ShareDeckModal
 */
interface ShareDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onMakePublic: () => Promise<boolean> | boolean;
  isAuthor?: boolean;
  deckId: string;
}

/**
 * Компонент модального окна для управления доступом к колоде,
 * когда автор удалил оригинал из облака.
 * Позволяет пользователю стать новым автором.
 */
export const ShareDeckDeleteCloudModal = ({
  visible,
  onClose,
  onCopyLink,
  onMakePublic,
  isAuthor = false,
  deckId,
}: ShareDeckModalProps) => {
  // --------------------------- Состояния ---------------------------
  const [step, setStep] = useState<
    "private" | "moderation" | "becomeAuthor" | "success"
  >("private");

  /** Флаг загрузки при становлении автором */
  const [isBecomingAuthor, setIsBecomingAuthor] = useState(false);

  /** Хранит результат takeOwnershipApi для обновления стора при закрытии */
  const ownershipResultRef = useRef<{
    cloud_uuid: string;
    type: string;
  } | null>(null);

  // Сброс шага при закрытии
  useEffect(() => {
    if (!visible) {
      setStep("private");
      setIsBecomingAuthor(false);
      ownershipResultRef.current = null;
    }
  }, [visible]);

  // --------------------------- Обработчики ---------------------------
  /**
   * Закрывает модальное окно.
   * Если пользователь стал автором — обновляет Zustand-стор,
   * чтобы isDeletedByAuthor стал false и иконка-предупреждение исчезла.
   */
  const handleClose = (): void => {
    if (ownershipResultRef.current) {
      const { cloud_uuid, type } = ownershipResultRef.current;
      const store = useDeckStore.getState();
      const current = store.decksState;
      if (current) {
        const updatedDecks = current.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cloud_info: {
                  ...d.cloud_info,
                  cloud_deck_id: cloud_uuid,
                  is_cloud_deck: true,
                  cloud_type: type as "PUBLIC" | "PRIVATE",
                  is_approved: true,
                  is_author: true,
                  needs_sync: false,
                },
              }
            : d,
        );
        store.setDecksState({ ...current, decks: updatedDecks });
      }
      ownershipResultRef.current = null;
    }
    setStep("private");
    onClose();
  };

  /**
   * Вызывает API становления автором.
   * После успеха — обновляет Zustand-стор сразу,
   * чтобы родительский компонент перерендерился с новым cloudDeckId
   * и onCopyLink мог скопировать корректную ссылку.
   */
  const handleConfirmBecomeAuthor = async (): Promise<void> => {
    if (!deckId) return;
    try {
      setIsBecomingAuthor(true);
      const result = await takeOwnershipApi(deckId);
      ownershipResultRef.current = {
        cloud_uuid: result.cloud_uuid,
        type: result.type,
      };

      // Сразу обновляем стор, чтобы родитель перерендерился
      // и isDeletedByAuthor стал false (cloud_deck_id больше не null)
      const store = useDeckStore.getState();
      const current = store.decksState;
      if (current) {
        const updatedDecks = current.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cloud_info: {
                  ...d.cloud_info,
                  cloud_deck_id: result.cloud_uuid,
                  is_cloud_deck: true,
                  cloud_type: result.type as "PUBLIC" | "PRIVATE",
                  is_approved: true,
                  is_author: true,
                  needs_sync: false,
                },
              }
            : d,
        );
        store.setDecksState({ ...current, decks: updatedDecks });
      }

      setStep("success");

      Toast.show({
        type: "success",
        text1: "Поздравляем!",
        text2: "Вы стали автором колоды",
        position: "bottom",
      });
    } catch (error) {
      console.error("Ошибка при смене автора:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Не удалось стать автором колоды",
        position: "bottom",
      });
    } finally {
      setIsBecomingAuthor(false);
    }
  };

  /**
   * Копирует ссылку и закрывает модалку.
   * К этому моменту стор уже обновлён (в handleConfirmBecomeAuthor),
   * поэтому родительский onCopyLink сможет использовать новый cloudDeckId.
   */
  const handleShareDeck = (): void => {
    onCopyLink();
    handleClose();
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
              {step === "becomeAuthor" ? (
                // =====================================================
                // ШАГ 2: Стать автором колоды? (Подтверждение)
                // =====================================================
                <View style={styles.stepContainer}>
                  <LogoCuteStar size={140} />

                  <Typography variant="h2" style={styles.stepTitle}>
                    Стать автором колоды?
                  </Typography>

                  <Typography variant="h3" style={styles.stepDescription}>
                    Вы внесли много изменений. Теперь вы можете стать
                    полноправным автором этой версии.
                  </Typography>

                  <View style={styles.benefitsList}>
                    <Typography variant="h3" style={styles.benefitsTitle}>
                      Что произойдет:
                    </Typography>

                    <View style={styles.benefitItem}>
                      <Typography variant="h3">
                        ✅ Все ваши локальные карточки и правки станут доступны в
                        сети
                      </Typography>
                    </View>

                    <View style={styles.benefitItem}>
                      <Typography variant="h3">
                        ✅ Вы сможете делиться этой колодой с друзьями, и они
                        будут автоматически получать ваши будущие обновления.
                      </Typography>
                    </View>
                  </View>

                  <Pressable
                    onPress={handleConfirmBecomeAuthor}
                    disabled={isBecomingAuthor}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      isBecomingAuthor && styles.primaryButtonDisabled,
                      pressed && !isBecomingAuthor && styles.primaryButtonPressed,
                    ]}
                  >
                    <Typography color="#FFFFFF" variant="h2">
                      {isBecomingAuthor ? "Подтверждение..." : "Подтвердить"}
                    </Typography>
                  </Pressable>

                  <Pressable
                    onPress={handleClose}
                    disabled={isBecomingAuthor}
                    style={styles.cancelButton}
                  >
                    <Typography color={colors.mainColor} variant="h2">
                      Отмена
                    </Typography>
                  </Pressable>
                </View>
              ) : step === "success" ? (
                // =====================================================
                // ШАГ 3: Вы — новый автор! (Успех)
                // =====================================================
                <View style={styles.stepContainer}>
                  <View style={styles.logoContainer}>
                    <Logo size={140} />
                  </View>

                  <Typography variant="h2" style={styles.stepTitle}>
                    Вы — новый автор!
                  </Typography>

                  <Typography
                    variant="h3"
                    color={colors.darkGray}
                    style={styles.successMessage}
                  >
                    Поздравляем! Теперь эта версия колоды сохранена в твоем
                    аккаунте и доступна в облаке. Ты можешь делиться ею с
                    друзьями, и они будут получать твои будущие обновления.
                  </Typography>

                  <SecondButton
                    title="Поделиться колодой"
                    onPress={handleShareDeck}
                    icon={
                      <Image
                        source={require("@/feature-decks/assets/IconLink.png")}
                        style={styles.linkIcon}
                      />
                    }
                    style={styles.shareButton}
                  />

                  <MainButton title="Перейти к колоде" onPress={handleClose} />
                </View>
              ) : (
                // =====================================================
                // ШАГ 1: Доступ к колоде (автор удалил)
                // =====================================================
                <View style={styles.stepContainer}>
                  <LogoSadStar size={140} style={styles.sadStarLogo} />

                  <Typography variant="h2" style={styles.stepTitle}>
                    Доступ к колоде
                  </Typography>

                  <Typography
                    variant="h3"
                    color={colors.darkGray}
                    style={styles.warningText}
                  >
                    Кажется автор удалил свою колоду. Если хотите поделится
                    ссылкой с друзьями вы можете стать автором
                  </Typography>

                  <Pressable
                    onPress={() => setStep("becomeAuthor")}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.primaryButtonPressed,
                    ]}
                  >
                    <Image
                      source={require("@/feature-decks/assets/IconAuthor.png")}
                      style={styles.primaryButtonIcon}
                    />
                    <Typography color="#FFFFFF" variant="h2">
                      Стать автором колоды
                    </Typography>
                  </Pressable>

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
const styles = StyleSheet.create({
  // Оверлей и контейнер
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
    paddingHorizontal: 12,
    minWidth: 373,
    width: "100%",
    maxWidth: 370,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  // Общие для всех шагов
  stepContainer: {
    width: "100%",
    alignItems: "center",
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepDescription: {
    textAlign: "center",
    marginBottom: 8,
  },

  // Шаг 1: доступ к колоде
  sadStarLogo: {
    marginBottom: 16,
  },
  warningText: {
    textAlign: "center",
    marginBottom: 16,
  },

  // Шаг 2: стать автором (бенефиты)
  benefitsList: {
    width: "100%",
    marginBottom: 16,
  },
  benefitsTitle: {
    textAlign: "left",
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // Шаг 3: успех
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  successMessage: {
    textAlign: "center",
    marginBottom: 16,
  },
  shareButton: {
    marginBottom: 12,
  },
  linkIcon: {
    width: 20,
    height: 20,
  },

  // Кнопки
  primaryButton: {
    backgroundColor: colors.mainColor,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    width: "100%",
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonIcon: {
    width: 10,
    height: 20,
    marginRight: 10,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 4,
    marginTop: 4,
  },
});
