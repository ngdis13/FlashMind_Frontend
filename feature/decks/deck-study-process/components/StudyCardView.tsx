// --------------------------- React ---------------------------
import { useEffect, useRef, useState } from "react";

// --------------------------- React Native ---------------------------
import {
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Animated,
  Platform,
} from "react-native";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";

// --------------------------- Компоненты ---------------------------
import { UserHint } from "@/components/UserHint";
import { HtmlText } from "@/feature-decks/deck-create-card/components/HtmlText";

// --------------------------- Типы и хелперы ---------------------------
import { Card } from "@/storage/types/types";
import { blocksToHtml } from "@/utils/helpers/blocksToHtml";

interface Props {
  card: Card | undefined;
  isFirstCard: boolean;
}

export const StudyCardView = ({ card, isFirstCard }: Props) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [wasFlipped, setWasFlipped] = useState<boolean>(false);
  const [showUserHint, setShowUserHint] = useState<boolean>(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDifficultyLevel = (): number => {
    // v2.0.0: difficulty — число FSRS
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
      {html ? <HtmlText html={html} /> : null}
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
          {renderCardContent(blocksToHtml(card?.front))}
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
          {renderCardContent(blocksToHtml(card?.back))}
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
