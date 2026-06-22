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
import { UserHint } from "@/components/UserHint";

interface Props {
  card: StudyCard | undefined;
  isFirstCard: boolean;
}

export const StudyCardView = ({ card, isFirstCard }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [wasFlipped, setWasFlipped] = useState(false);
  const [showUserHint, setShowUserHint] = useState(false); // Управление видимостью ИИ-подсказки

  const flipAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- ОБРАБОТКА ДРОБНОЙ СЛОЖНОСТИ ---
  const getDifficultyLevel = (): number => {
    if (!card?.difficulty) return 0;
    if ((card.difficulty as unknown) === "none") return 0;

    const parsed = Number(card.difficulty);
    if (isNaN(parsed)) return 0;

    const rounded = Math.round(parsed);
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

  // Переключение ИИ-подсказки с автоскрытием через 3 секунды
  const handleDotsPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setShowUserHint((prev) => {
      const nextState = !prev;
      if (nextState) {
        timerRef.current = setTimeout(() => {
          setShowUserHint(false);
        }, 3000);
      }
      return nextState;
    });
  };

  // Закрытие подсказки вручную
  const handleCloseHint = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowUserHint(false);
  };

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Логика появления/исчезновения подсказки «Нажми, чтобы перевернуть»
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

  // Сброс состояния при смене карточки
  useEffect(() => {
    setIsFlipped(false);
    flipAnim.setValue(0);
    setShowUserHint(false);
  }, [card?.id]);

  // Функция переворота карточки
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

  // Функция для отрисовки массива из 5 точек сложности с кликабельной оберткой
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
          {/* Рендерим точки сложности */}
          {renderDifficultyDots()}

          {/* Встроенный универсальный хинт с ИИ-акцентом */}
          <UserHint
            visible={showUserHint}
            text="Сложность карточки рассчитывается нашей ИИ-моделью. Алгоритм анализирует твои ответы и сам решает, когда повторить материал!"
            onClose={handleCloseHint}
            style={styles.absoluteHint}
          />

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
  container: { 
    flex: 1, 
    marginBottom: 24,
    width: '100%',
    minWidth: 370,
    alignSelf: 'center', // Центрирование
  },
  touchArea: { 
    flex: 1,
    width: '100%',
  },
  card: { 
    flex: 1, 
    backfaceVisibility: "hidden", 
    paddingBottom: 20,
    width: '100%',
  },
  cardFront: { 
    backgroundColor: "#FFFFFF", 
    position: "relative",
    width: '100%',
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: "#FFFFFF",
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 20,
    width: '100%',
  },
  mainText: { 
    textAlign: "center",
    width: '100%',
  },
  hintTextInside: { 
    textAlign: "center", 
    paddingBottom: 10,
    width: '100%',
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5, 
  },
  absoluteHint: {
    position: "absolute",
    top: 36,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 999,
  },
});
