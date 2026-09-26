// feature-decks/deck-create-card/components/PreviewModal.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  useWindowDimensions,
  View,
} from "react-native";
import { colors } from "@/styles/Colors";
import { CARD_DISPLAY } from "@/styles/CardDisplay";
import { CardBlock } from "../types/cardBlocks";
import { useCardScale } from "@/utils/hooks/useCardScale";
import { MainButton } from "@/components/MainButton";
import { PreviewBlock } from "./preview/PreviewBlock";
import type { PreviewBlockContext } from "./preview/types";

interface PreviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  frontBlocks: CardBlock[];
  backBlocks?: CardBlock[];
  initialSide?: "front" | "back";
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isVisible,
  onClose,
  frontBlocks,
  backBlocks = [],
  initialSide = "front",
}) => {
  const { width: windowWidth } = useWindowDimensions();
  // На десктопе модалка крупнее — по ширине как карточка обучения
  const isWide = windowWidth >= CARD_DISPLAY.WIDE_SCREEN_MIN_WIDTH;

  // Коэффициент масштабирования КОНТЕНТА карточки предпросмотра —
  // тот же, что в обучении: 1 на телефонах, до 1.35 на планшетах/десктопе
  // (шрифты через scaledText — мягче, до +20%)
  const { textScale, scaled, scaledText } = useCardScale();

  // Храним состояние переворота
  const [isFlipped, setIsFlipped] = useState(initialSide === "back");

  // Состояние интерактивных quiz-блоков: выбор вариантов и проверка
  const [quizSelections, setQuizSelections] = useState<
    Record<string, number[]>
  >({});
  const [checkedQuizIds, setCheckedQuizIds] = useState<string[]>([]);

  // Одно общее анимированное значение 0..1, как в StudyCardView
  const animatedValue = useRef(
    new Animated.Value(initialSide === "back" ? 1 : 0),
  ).current;

  // Синхронизируем состояние при каждом новом открытии поп-апа
  useEffect(() => {
    if (isVisible) {
      const shouldBeFlipped = initialSide === "back";
      setIsFlipped(shouldBeFlipped);
      animatedValue.setValue(shouldBeFlipped ? 1 : 0);
      // Сбрасываем интерактив quiz-блоков при каждом открытии
      setQuizSelections({});
      setCheckedQuizIds([]);
    }
  }, [isVisible, initialSide, animatedValue]);

  // Клик по варианту quiz-блока — toggle (верных может быть несколько)
  const handleToggleQuizOption = (blockId: string, index: number): void => {
    setQuizSelections((prev) => {
      const current = prev[blockId] ?? [];
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [blockId]: next };
    });
  };

  // «Проверить» — фиксирует результат для всех quiz-блоков стороны
  const handleCheckSide = (blocks: CardBlock[]): void => {
    const ids = blocks.filter((b) => b.type === "quiz").map((b) => b.id);
    setCheckedQuizIds((prev) => [...new Set([...prev, ...ids])]);
  };

  // Есть ли на стороне quiz-блоки вообще (кнопка видна всегда, пока есть quiz)
  const hasQuiz = (blocks: CardBlock[]): boolean =>
    blocks.some((b) => b.type === "quiz");

  // Все ли quiz-блоки стороны уже проверены (для disabled кнопки)
  const isSideChecked = (blocks: CardBlock[]): boolean =>
    blocks
      .filter((b) => b.type === "quiz")
      .every((b) => checkedQuizIds.includes(b.id));

  // Контекст, который модалка отдаёт всем блокам превью
  const previewContext = useMemo<PreviewBlockContext>(
    () => ({
      quizSelections,
      checkedQuizIds,
      onToggleQuizOption: handleToggleQuizOption,
    }),
    [quizSelections, checkedQuizIds],
  );

  // Точь-в-точь нативная механика переворота из обучения.
  // Переворот доступен всегда — даже если одна из сторон ещё не заполнена
  const handleCardPress = () => {
    const nextFlipped = !isFlipped;
    Animated.timing(animatedValue, {
      toValue: nextFlipped ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIsFlipped(nextFlipped));
  };

  // Идентичная интерполяция углов вращения
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  // Плавное переключение видимости сторон в момент полуоборота
  const frontOpacity = animatedValue.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [1, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  // Рендер блоков стороны через реестр превью: тип блока → компонент
  const renderBlocksContent = (blocks: CardBlock[]) =>
    blocks.map((block) => (
      <PreviewBlock key={block.id} block={block} context={previewContext} />
    ));

  // Динамические стили контента карточки: пересоздаются только при смене
  // scale. На мобильных (scale = 1) значения равны эталонным — 372×520,
  // на десктопе контент растёт внутри карточки 650×750
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        cardContainer: {
          width: scaled(CARD_DISPLAY.width),
          height: scaled(CARD_DISPLAY.height),
          position: "relative",
        },
        scrollContent: {
          flexGrow: 1,
          // Блоки на всю ширину — контент слева, по центру вертикали — как в обучении
          alignItems: "stretch",
          justifyContent: "center",
          gap: scaled(CARD_DISPLAY.blockGap),
          // Паддинги — зеркало .editor-input { padding: 16px 14px }
          paddingTop: scaled(CARD_DISPLAY.paddingTop),
          paddingBottom: scaled(CARD_DISPLAY.paddingBottom),
          paddingHorizontal: scaled(CARD_DISPLAY.paddingHorizontal),
        },
      }),
    [scaled],
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Тап по темному фону закрывает поп-ап */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Белая карточка перехватывает нажатие для переворота */}
        <Pressable
          style={[
            dynamicStyles.cardContainer,
            isWide && {
              // Десктоп: карточка ограничена maxWidth 650 — как в обучении
              width: "95%",
              maxWidth: CARD_DISPLAY.desktopMaxWidth,
              height: CARD_DISPLAY.desktopHeight,
            },
          ]}
          onPress={handleCardPress}
        >
          {/* СЛОЙ ЛИЦЕВОЙ СТОРОНЫ */}
          <Animated.View
            style={[styles.cardFace, frontAnimatedStyle]}
            pointerEvents={isFlipped ? "none" : "auto"}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={dynamicStyles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderBlocksContent(frontBlocks)}
            </ScrollView>

            {/* Кнопка «Проверить» — видна всегда, после проверки неактивна */}
            {hasQuiz(frontBlocks) && (
              <View style={styles.quizCheckWrapper}>
                <MainButton
                  style={{ width: "100%" }}
                  title="Проверить"
                  onPress={() => handleCheckSide(frontBlocks)}
                  disabled={isSideChecked(frontBlocks)}
                />
              </View>
            )}
          </Animated.View>

          {/* СЛОЙ ОБРАТНОЙ СТОРОНЫ — рендерим всегда, переворот доступен всегда */}
          <Animated.View
            style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}
            pointerEvents={isFlipped ? "auto" : "none"}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={dynamicStyles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderBlocksContent(backBlocks)}
            </ScrollView>

            {/* Кнопка «Проверить» — видна всегда, после проверки неактивна */}
            {hasQuiz(backBlocks) && (
              <View style={styles.quizCheckWrapper}>
                <MainButton
                  style={{ width: "100%" }}
                  title="Проверить"
                  onPress={() => handleCheckSide(backBlocks)}
                  disabled={isSideChecked(backBlocks)}
                />
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
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
  topSideIndicator: {
    position: "absolute",
    top: -28,
    left: 8,
    fontSize: 13,
    fontFamily: "MontserratBold",
    color: colors.darkGray || "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardFace: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: CARD_DISPLAY.radius,
    // Паддинг убран — точные паддинги редактора (.editor-input) заданы в scrollContent
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardBack: {
    position: "absolute",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  quizCheckWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  termText: {
    textAlign: "center",
    fontSize: 22,
    fontFamily: "MontserratBold",
    color: "#1E1F4B",
    width: "100%",
  },
  bodyText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    color: "#4A4A4A",
    width: "100%",
  },
  placeholderText: {
    color: colors.darkGray || "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
  },
  trainingImage: {
    width: 290,
    height: 230,
    borderRadius: 16,
    resizeMode: "cover",
  },
});
