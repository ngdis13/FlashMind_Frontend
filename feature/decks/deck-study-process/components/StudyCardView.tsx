// --------------------------- React ---------------------------
import { useEffect, useMemo, useRef, useState } from "react";

// --------------------------- React Native ---------------------------
import {
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";
import { CARD_DISPLAY } from "@/styles/CardDisplay";

// --------------------------- Компоненты ---------------------------
import { UserHint } from "@/components/UserHint";
import { StudyBlocksView } from "./StudyBlocksView";

// --------------------------- Хуки ---------------------------
import { useCardScale } from "@/utils/hooks/useCardScale";

// --------------------------- Типы и хелперы ---------------------------
import { Card } from "@/storage/types/types";

interface Props {
  card: Card | undefined;
  isFirstCard: boolean;
}

export const StudyCardView = ({ card, isFirstCard }: Props) => {
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= CARD_DISPLAY.WIDE_SCREEN_MIN_WIDTH;
  const { textScale, scaled, scaledText } = useCardScale();

  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [wasFlipped, setWasFlipped] = useState<boolean>(false);
  const [showUserHint, setShowUserHint] = useState<boolean>(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDifficultyLevel = (): number => {
    if (!card?.difficulty) return 0;
    return Math.max(1, Math.min(5, Math.round(card.difficulty)));
  };

  const difficultyLevel = getDifficultyLevel();

  const getDifficultyColor = (level: number): string => {
    if (level <= 1) return "#6BC770";
    if (level === 2) return "#7EE083";
    if (level === 3) return "#FFDA62";
    if (level === 4) return "#FFA162";
    return "#FF5151";
  };

  const handleDotsPress = (): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowUserHint((prev) => {
      const nextState = !prev;
      if (nextState) {
        timerRef.current = setTimeout(() => setShowUserHint(false), 3000);
      }
      return nextState;
    });
  };

  const handleCloseHint = (): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowUserHint(false);
  };

  const handleFlip = (): void => {
    if (!wasFlipped) setWasFlipped(true);
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      // ВАЖНО: Для веба отключаем nativeDriver, чтобы 3D-трансформация не ломала клики в браузере
      useNativeDriver: Platform.OS !== "web",
      friction: 8,
      tension: 10,
    }).start();
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isFirstCard && !isFlipped && !wasFlipped) {
      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 800,
        delay: 500,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    } else {
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
  }, [isFirstCard, isFlipped, wasFlipped]);

  useEffect(() => {
    setIsFlipped(false);
    flipAnim.setValue(0);
    setShowUserHint(false);
  }, [card?.id]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [1, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [0, 1],
  });

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: scaled(24),
          maxWidth: "100%",
          alignSelf: "center",
        },
        scrollContent: {
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: scaled(CARD_DISPLAY.paddingTop),
          paddingBottom: scaled(CARD_DISPLAY.paddingBottom),
          paddingHorizontal: scaled(CARD_DISPLAY.paddingHorizontal),
          width: "100%",
        },
        absoluteHint: {
          position: "absolute",
          top: scaled(36),
          left: 0,
          right: 0,
          paddingHorizontal: scaled(16),
          zIndex: 999,
        },
      }),
    [scaled],
  );

  const renderDifficultyDots = () => {
    const activeColor =
      difficultyLevel > 0 ? getDifficultyColor(difficultyLevel) : "#BBBBBB";
    return (
      <Pressable
        onPress={handleDotsPress}
        style={styles.dotsPressArea}
        hitSlop={{ top: 15, bottom: 15, left: 30, right: 30 }}
      >
        <View style={styles.dotsContainer}>
          {[1, 2, 3, 4, 5].map((index) => {
            const isActive = index <= difficultyLevel;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: isActive ? activeColor : "#BBBBBB" },
                ]}
              />
            );
          })}
        </View>
      </Pressable>
    );
  };

  const renderCardContent = (blocks: Card["front"] | undefined) => (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={dynamicStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <StudyBlocksView blocks={blocks} />
    </ScrollView>
  );

  return (
    <View
      style={[
        dynamicStyles.container,
        isWide
          ? {
              width: CARD_DISPLAY.desktopMaxWidth,
              maxWidth: "100%",
              height: CARD_DISPLAY.desktopHeight,
              maxHeight: "100%",
            }
          : {
              width: scaled(CARD_DISPLAY.width),
              height: scaled(CARD_DISPLAY.height),
            },
      ]}
    >
      {/* Оригинальный Pressable, но теперь дочерние слои управляют своей активностью */}
      <Pressable style={styles.touchArea} onPress={handleFlip}>
        {/* ЛИЦЕВАЯ СТОРОНА КАРТОЧКИ */}
        <Animated.View
          style={[
            commonStyles.mainBox,
            styles.card,
            styles.cardFront,
            {
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity,
            },
          ]}
          // ИСПРАВЛЕНИЕ: Отключаем жесты для стороны, когда она перевернута (как в превью)
          pointerEvents={isFlipped ? "none" : "auto"}
        >
          {renderDifficultyDots()}
          <UserHint
            visible={showUserHint}
            text="Сложность карточки рассчитывается нашей ИИ-моделью. Алгоритм анализирует твои ответы и сам решает, когда повторить материал!"
            onClose={handleCloseHint}
            style={dynamicStyles.absoluteHint}
          />
          {renderCardContent(card?.front)}
          <Animated.View style={{ opacity: hintOpacity }} />
        </Animated.View>

        {/* ОБРАТНАЯ СТОРОНА КАРТОЧКИ */}
        <Animated.View
          style={[
            commonStyles.mainBox,
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }], opacity: backOpacity },
          ]}
          // ИСПРАВЛЕНИЕ: Включаем жесты только тогда, когда сторона активна (как в превью)
          pointerEvents={isFlipped ? "auto" : "none"}
        >
          {renderCardContent(card?.back)}
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  dotsPressArea: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    zIndex: 101,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  touchArea: { flex: 1, width: "100%" },
  scroll: {
    flex: 1,
    width: "100%",
  },
  card: {
    flex: 1,
    backfaceVisibility: "hidden",
    width: "100%",
    padding: 0,
    borderWidth: 0,
  },
  cardFront: {
    backgroundColor: "#FFFFFF",
    position: "relative",
    width: "100%",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
});
