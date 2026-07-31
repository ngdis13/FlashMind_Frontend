// --------------------------- React ---------------------------
import { useEffect, useRef, useState } from "react";

// --------------------------- React Native ---------------------------
import {
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Animated,
} from "react-native";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";

// --------------------------- Компоненты ---------------------------
import { UserHint } from "@/components/UserHint";

// --------------------------- Типы ---------------------------
import { StudyCard } from "@/feature-decks/deck-study-process/api/api";

/**
 * Убирает HTML-теги, оставляя только чистый текст
 */
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(div|p|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
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
        toValue: 1, duration: 800, delay: 500, useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(hintOpacity, {
        toValue: 0, duration: 300, useNativeDriver: true,
      }).start();
    }
  }, [isFirstCard, isFlipped, wasFlipped]);

  useEffect(() => {
    setIsFlipped(false);
    flipAnim.setValue(0);
    setShowUserHint(false);
  }, [card?.id]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1], outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1], outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5], outputRange: [1, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5], outputRange: [0, 1],
  });

  const renderDifficultyDots = () => {
    const activeColor = difficultyLevel > 0 ? getDifficultyColor(difficultyLevel) : "#BBBBBB";
    return (
      <Pressable onPress={handleDotsPress} style={styles.dotsPressArea} hitSlop={{ top: 15, bottom: 15, left: 30, right: 30 }}>
        <View style={styles.dotsContainer}>
          {[1, 2, 3, 4, 5].map((index) => {
            const isActive = index <= difficultyLevel;
            return (
              <View
                key={index}
                style={[styles.dot, { backgroundColor: isActive ? activeColor : "#BBBBBB" }]}
              />
            );
          })}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.touchArea} onPress={handleFlip}>
        {/* ПЕРЕДНЯЯ СТОРОНА */}
        <Animated.View
          style={[
            commonStyles.mainBox, styles.card, styles.cardFront,
            { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity },
          ]}
        >
          {renderDifficultyDots()}

          <UserHint
            visible={showUserHint}
            text="Сложность карточки рассчитывается нашей ИИ-моделью. Алгоритм анализирует твои ответы и сам решает, когда повторить материал!"
            onClose={handleCloseHint}
            style={styles.absoluteHint}
          />

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Typography variant="h2" style={[styles.mainText, { fontWeight: "800" }]}>
              {stripHtml(card?.front || '')}
            </Typography>
          </ScrollView>

          <Animated.View style={{ opacity: hintOpacity }}>
            <Typography variant="h3" color="gray" style={styles.hintTextInside}>
              Нажми, чтобы перевернуть
            </Typography>
          </Animated.View>
        </Animated.View>

        {/* ЗАДНЯЯ СТОРОНА */}
        <Animated.View
          style={[
            commonStyles.mainBox, styles.card, styles.cardBack,
            { transform: [{ rotateY: backInterpolate }], opacity: backOpacity },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Typography variant="h2" style={styles.mainText}>
              {stripHtml(card?.back || '')}
            </Typography>
          </ScrollView>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 24, width: '100%', minWidth: 370, alignSelf: 'center' },
  touchArea: { flex: 1, width: '100%' },
  card: { flex: 1, backfaceVisibility: "hidden", paddingBottom: 20, width: '100%' },
  cardFront: { backgroundColor: "#FFFFFF", position: "relative", width: '100%' },
  cardBack: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20, width: '100%' },
  mainText: { textAlign: "center", width: '100%' },
  hintTextInside: { textAlign: "center", paddingBottom: 10, width: '100%' },
  dotsPressArea: { width: "100%", alignItems: "center", marginTop: 12, zIndex: 101 },
  dotsContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, width: "100%" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  absoluteHint: { position: "absolute", top: 36, left: 0, right: 0, paddingHorizontal: 16, zIndex: 999 },
});
