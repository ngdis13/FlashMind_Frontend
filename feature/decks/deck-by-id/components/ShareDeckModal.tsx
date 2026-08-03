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
  ActivityIndicator,
} from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { LogoCuteStar } from "@/components/LogoCuteStar";

// --------------------------- API ---------------------------
import { checkCanTakeOwnershipApi, takeOwnershipApi } from "@/storage/api/api";
import type { CanTakeOwnershipResponse } from "@/storage/api/api";

// --------------------------- Компоненты ---------------------------
import { BecomeAuthorModalContent } from "./BecomeAuthorModal";

// --------------------------- Сторонние библиотеки ---------------------------
import Toast from "react-native-toast-message";
import { Logo } from "@/components/Logo";
import { useDeckStore } from "@/store/deck.store";

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
  deckId: string;
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
  deckId,
}: ShareDeckModalProps) => {
  // --------------------------- Состояния ---------------------------
  /**
   * Текущий шаг модального окна для автора
   * - "private": приватный доступ (шаг 1)
   * - "moderation": ожидание модерации (шаг 2)
   */
  const [step, setStep] = useState<"private" | "moderation">("private");

  /** Результат проверки условий для становления автором */
  const [ownershipCheck, setOwnershipCheck] =
    useState<CanTakeOwnershipResponse | null>(null);
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(false);
  const [nonAuthorStep, setNonAuthorStep] = useState<
    "conditions" | "confirm" | "success"
  >("conditions");
  const [isBecomingAuthor, setIsBecomingAuthor] = useState(false);
  const ownershipResultRef = useRef<{
    cloud_uuid: string;
    type: string;
  } | null>(null);

  // Запрос проверки при открытии модалки для не-автора
  useEffect(() => {
    if (visible && !isAuthor && deckId) {
      setIsCheckingOwnership(true);
      setOwnershipCheck(null);
      checkCanTakeOwnershipApi(deckId)
        .then(setOwnershipCheck)
        .catch(() => setOwnershipCheck(null))
        .finally(() => setIsCheckingOwnership(false));
    }
    if (!visible) {
      setOwnershipCheck(null);
      setIsCheckingOwnership(false);
      setNonAuthorStep("conditions");
    }
  }, [visible, isAuthor, deckId]);

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
    // Если стали автором — обновляем стор при закрытии
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

  /** Проверки условий */
  const descOk = ownershipCheck?.description_changed === true;
  const cardsOk = (ownershipCheck?.cards_needed_count ?? 999) === 0;
  const canBecomeAuthor = descOk && cardsOk;
  const cardsNeeded = ownershipCheck?.cards_needed_count ?? 0;

  const onBecomeAuthor = () => {
    setNonAuthorStep("confirm");
  };

  const handleBecomeAuthorConfirm = async () => {
    if (!deckId) return;
    try {
      setIsBecomingAuthor(true);
      const result = await takeOwnershipApi(deckId);
      ownershipResultRef.current = {
        cloud_uuid: result.cloud_uuid,
        type: result.type,
      };
      setNonAuthorStep("success");
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
                    <Typography
                      variant="h3"
                      color={colors.darkGray}
                      style={styles.hint}
                    >
                      Сейчас колоду видишь только ты и те, с кем ты поделишься
                      ссылкой
                    </Typography>

                    <View style={{ marginTop: 16, marginBottom: 16 }}>
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
                      <Typography
                        variant="h3"
                        color={colors.darkGray}
                        style={styles.hint}
                      >
                        Колода появится в общем каталоге и будет доступна для
                        поиска всем пользователям
                      </Typography>
                    </View>

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
              ) : nonAuthorStep === "confirm" ? (
                <BecomeAuthorModalContent
                  onConfirm={handleBecomeAuthorConfirm}
                  onClose={handleClose}
                  isLoading={isBecomingAuthor}
                />
              ) : nonAuthorStep === "success" ? (
                // ШАГ 3: Успешное становление автором
                <View style={{ width: "100%", alignItems: "center" }}>
                  <View style={styles.logoContainer}>
                    <Logo size={140} />
                  </View>

                  <Typography variant="h2" style={styles.title}>
                    Вы — новый автор!
                  </Typography>

                  <Typography
                    variant="h3"
                    color={colors.darkGray}
                    style={styles.successDescription}
                  >
                    Поздравляем! Теперь эта версия колоды сохранена в твоем
                    аккаунте и доступна в облаке. Ты можешь делиться ею с
                    друзьями, и они будут получать твои будущие обновления.
                  </Typography>

                  <SecondButton
                    title="Поделиться колодой"
                    onPress={() => {
                      onCopyLink();
                      handleClose();
                    }}
                    icon={
                      <Image
                        source={require("@/feature-decks/assets/IconLink.png")}
                        style={{ width: 20, height: 20 }}
                      />
                    }
                    style={{ marginBottom: 12 }}
                  />

                  <MainButton title="Перейти к колоде" onPress={handleClose} />
                </View>
              ) : (
                // ШАГ 1 ДЛЯ НЕ-АВТОРА: Условия
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

                  <View style={styles.separator} />

                  {/* Блок условий для становления автором */}
                  <View style={styles.authorBlock}>
                    <Typography variant="h3" style={styles.authorBlockTitle}>
                      Если ты хочешь поделиться колодой со своими карточками, то
                      ты можешь стать автором колоды
                    </Typography>

                    <Typography variant="h3" style={styles.authorBlockSubtitle}>
                      Чтобы стать автором нужно:
                    </Typography>

                    {isCheckingOwnership ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.mainColor}
                        style={{ marginVertical: 12 }}
                      />
                    ) : (
                      <>
                        <View style={styles.checkListItem}>
                          <Typography style={styles.checkIcon}>
                            {descOk ? "✅" : "❌"}
                          </Typography>
                          <Typography variant="h3">
                            Изменить описание
                          </Typography>
                        </View>

                        <View style={styles.checkListItem}>
                          <Typography style={styles.checkIcon}>
                            {cardsOk ? "✅" : "❌"}
                          </Typography>
                          <Typography variant="h3">
                            {cardsOk
                              ? "Добавить/изменить 20% карточек"
                              : `Добавить/изменить 20% карточек (ещё ${cardsNeeded} карточки)`}
                          </Typography>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Основная кнопка действия (Стать автором) */}
                  <Pressable
                    onPress={canBecomeAuthor ? onBecomeAuthor : undefined}
                    disabled={!canBecomeAuthor || isCheckingOwnership}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      (!canBecomeAuthor || isCheckingOwnership) &&
                        styles.primaryButtonDisabled,
                      pressed && canBecomeAuthor && { opacity: 0.8 },
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
    width: 340,
  },
  /**
   * Стиль текста на шаге модерации
   */
  successDescription: {
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
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
    paddingVertical: 4,
  },

  separator: {
    height: 2,
    backgroundColor: colors.mainColor,
    width: "100%",
    marginTop: 16,
  },

  /**
   * Контейнер для информационного блока автора
   */
  authorBlock: {
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  /**
   * Главный текст информационного блока
   */
  authorBlockTitle: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },
  /**
   * Подзаголовок списка требований
   */
  authorBlockSubtitle: {
    textAlign: "left",
    marginBottom: 4,
  },
  /**
   * Строка элемента чек-листа
   */
  checkListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  /**
   * Стилизация иконки эмодзи галочки/крестика
   */
  checkIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  /**
   * Текст элемента чек-листа
   */
  checkText: {
    flex: 1,
    textAlign: "left",
  },
  /**
   * Главная залитая кнопка «Стать автором колоды»
   */
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButton: {
    backgroundColor: colors.mainColor,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    width: "100%",
    marginBottom: 16,
  },
  /**
   * Иконка карандаша внутри главной кнопки
   */
  primaryButtonIcon: {
    width: 10,
    height: 20,
    marginRight: 10,
  },
});
