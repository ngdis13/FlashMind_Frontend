import { commonStyles } from "@/styles/Common";
import {
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Animated,
} from "react-native";
import { StudyCard } from "../../api/api";
import { Typography } from "@/styles/Typography";
import { useEffect, useRef, useState } from "react";

interface Props {
  card: StudyCard | undefined;
  isFirstCard: boolean;
}

export const StudyCardView = ({ card, isFirstCard }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [wasFlipped, setWasFlipped] = useState(false); // Отслеживаем, был ли хоть один переворот

  const flipAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;

  // --- ОБРАБОТКА ДРОБНОЙ СЛОЖНОСТИ ---
  const getDifficultyLevel = (): number => {
    if (!card?.difficulty || card.difficulty === "none") return 0;

    // Преобразуем длинную строку/дробь в число и округляем до ближайшего целого
    const parsed = Number(card.difficulty);
    if (isNaN(parsed)) return 0;

    const rounded = Math.round(parsed);

    // Ограничиваем рамками от 1 до 5, чтобы сетка из 5 точек не сломалась
    return Math.max(1, Math.min(5, rounded));
  };

  const difficultyLevel = getDifficultyLevel();

  // Определение цвета для активных точек сложности 
  const getDifficultyColor = (level: number): string => {
    if (level <= 1) return "#6BC770";
    if (level === 2) return "#7EE083";
    if (level === 3) return "#FFDA62";
    if (level === 4) return "#FFA162";
    return "#FF5151";
  };

  // Логика появления/исчезновения подсказки
  useEffect(() => {
    if (isFirstCard && !isFlipped && !wasFlipped) {
      // Плавно показываем на первой карточке
      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 800,
        delay: 500, // Появится чуть позже самой карточки
        useNativeDriver: true,
      }).start();
    } else {
      // Плавно скрываем навсегда
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
  }, [card?.id]);

  const handleFlip = () => {
    if (!wasFlipped) setWasFlipped(true);

    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Интерполяции для 3D
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

  // Функция для отрисовки массива из 5 точек сложности
  const renderDifficultyDots = () => {
    const activeColor =
      difficultyLevel > 0 ? getDifficultyColor(difficultyLevel) : "#BBBBBB";

    return (
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
    );
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.touchArea} onPress={handleFlip}>
        {/* ПЕРЕДНЯЯ СТОРОНА */}
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Typography
              variant="h2"
              style={[styles.mainText, { fontWeight: "800" }]}
            >
              {card?.front}
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
            commonStyles.mainBox,
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }], opacity: backOpacity },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Typography variant="h2" style={styles.mainText}>
              {card?.back}
            </Typography>
          </ScrollView>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 24 },
  touchArea: { flex: 1 },
  card: { flex: 1, backfaceVisibility: "hidden", paddingBottom: 20 },
  cardFront: { backgroundColor: "#FFFFFF" },
  cardBack: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  mainText: { textAlign: "center" },
  hintTextInside: { textAlign: "center", paddingBottom: 10 },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 1100,
  },
});
