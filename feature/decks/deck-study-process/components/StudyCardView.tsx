// --------------------------- React ---------------------------
import { useEffect, useRef, useState } from "react";

// --------------------------- React Native ---------------------------
import {
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Animated,
  useWindowDimensions,
  Platform,
} from "react-native";

// --------------------------- Сторонние библиотеки ---------------------------
import RenderHtml from "react-native-render-html";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";

// --------------------------- Компоненты ---------------------------
import { UserHint } from "@/components/UserHint";

// --------------------------- Типы ---------------------------
import { StudyCard } from "@/feature-decks/deck-study-process/api/api";

const systemFont = "MontserratSemiBold";
const textColor = "#282B54";

/**
 * Стили HTML — соответствуют редактору:
 * - body: Regular (400) по умолчанию, по центру
 * - <b>/<strong>: Bold (700)
 * - <i>/<em>: курсив
 * - <u>: подчёркнутый
 * - списки: отступы, текст слева
 */
const tagsStyles = {
  body: {
    fontFamily: "Montserrat",
    fontWeight: "400" as const,
    fontSize: 16,
    color: textColor,
    textAlign: "center" as const,
  },
  b: { fontWeight: "700" as const },
  strong: { fontWeight: "700" as const },
  i: { fontStyle: "italic" as const },
  em: { fontStyle: "italic" as const },
  u: { textDecorationLine: "underline" as const },
  ul: { textAlign: "left" as const, paddingLeft: 24, marginVertical: 4 },
  ol: { textAlign: "left" as const, paddingLeft: 24, marginVertical: 4 },
  li: { marginVertical: 2 },
};

interface Props {
  card: StudyCard | undefined;
  isFirstCard: boolean;
}

export const StudyCardView = ({ card, isFirstCard }: Props) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [wasFlipped, setWasFlipped] = useState<boolean>(false);
  const [showUserHint, setShowUserHint] = useState<boolean>(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - 80, 600);

  const getDifficultyLevel = (): number => {
    if (!card?.difficulty) return 0;
    if ((card.difficulty as unknown) === "none") return 0;
    const parsed = Number(card.difficulty);
    if (isNaN(parsed)) return 0;
    const rounded = Math.round(parsed);
    return Math.max(1, Math.min(5, rounded));
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
      useNativeDriver: true,
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
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isFirstCard, isFlipped, wasFlipped]);

  useEffect(() => {
    setIsFlipped(false);
    flipAnim.setValue(0);
    setShowUserHint(false);
  }, [card?.id]);

  // ⌨️ Пробел — переворот карточки
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const renderCardContent = (html: string) => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {html ? (
        <RenderHtml
          contentWidth={contentWidth}
          source={{ html }}
          tagsStyles={tagsStyles}
          systemFonts={[systemFont, "Montserrat"]}
        />
      ) : null}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.touchArea} onPress={handleFlip}>
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
        >
          {renderDifficultyDots()}
          <UserHint
            visible={showUserHint}
            text="Сложность карточки рассчитывается нашей ИИ-моделью. Алгоритм анализирует твои ответы и сам решает, когда повторить материал!"
            onClose={handleCloseHint}
            style={styles.absoluteHint}
          />
          {renderCardContent(card?.front || "")}
          <Animated.View style={{ opacity: hintOpacity }} />
        </Animated.View>

        <Animated.View
          style={[
            commonStyles.mainBox,
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }], opacity: backOpacity },
          ]}
        >
          {renderCardContent(card?.back || "")}
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 24,
    width: "95%",
    minWidth: 370,
    alignSelf: "center",
  },
  touchArea: { flex: 1, width: "100%" },
  card: {
    flex: 1,
    backfaceVisibility: "hidden",
    paddingBottom: 20,
    width: "100%",
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    width: "100%",
  },
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
  absoluteHint: {
    position: "absolute",
    top: 36,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 999,
  },
});
