// feature-decks/deck-create-card/components/PreviewModal.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Animated,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { CardBlock } from "../types/cardBlocks";

interface PreviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  frontBlocks: CardBlock[];
  backBlocks?: CardBlock[];
  initialSide?: "front" | "back";
  // Разрешить переворот тапом (по умолчанию да)
  allowFlip?: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isVisible,
  onClose,
  frontBlocks,
  backBlocks = [],
  initialSide = "front",
  allowFlip = true,
}) => {
  // Переворот доступен только если он разрешён И есть обе стороны
  const isTwoSided = allowFlip && backBlocks.length > 0;

  // Обратный слой рендерим и в режиме «поп-ап заблокирован на обороте»
  const showBackLayer = isTwoSided || (!allowFlip && initialSide === "back");

  // Храним состояние переворота
  const [isFlipped, setIsFlipped] = useState(initialSide === "back");

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
    }
  }, [isVisible, initialSide, animatedValue]);

  // Точь-в-точь нативная механика переворота из обучения
  const handleCardPress = () => {
    if (!isTwoSided) return;

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

  const renderBlocksContent = (blocks: CardBlock[]) => {
    return blocks.map((block) => {
      if (block.type === "term" || block.type === "text") {
        return (
          <Typography
            key={block.id}
            variant={'h2'}
            style={[
              !block.value && styles.placeholderText,
            ]}
          >
            {block.value ||
              (block.type === "term" ? "Пустой термин" : "Пустой текст")}
          </Typography>
        );
      }

      if (block.type === "image") {
        return block.url ? (
          <Image
            key={block.id}
            source={{ uri: block.url }}
            style={styles.trainingImage}
          />
        ) : (
          <Typography
            key={block.id}
            variant="h3"
            style={styles.placeholderText}
          >
            [Изображение не загружено]
          </Typography>
        );
      }
      return null;
    });
  };

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
          style={styles.cardContainer}
          onPress={handleCardPress}
        >

          {/* СЛОЙ ЛИЦЕВОЙ СТОРОНЫ */}
          <Animated.View
            style={[styles.cardFace, frontAnimatedStyle]}
            pointerEvents={isFlipped ? "none" : "auto"}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderBlocksContent(frontBlocks)}
            </ScrollView>
          </Animated.View>

          {/* СЛОЙ ОБРАТНОЙ СТОРОНЫ */}
          {showBackLayer && (
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                backAnimatedStyle,
              ]}
              pointerEvents={isFlipped ? "auto" : "none"}
            >
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {renderBlocksContent(backBlocks)}
              </ScrollView>
            </Animated.View>
          )}
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
  cardContainer: {
    width: 372,
    height: 520,
    position: "relative",
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
    borderRadius: 24,
    padding: 16,
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
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 10,
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
