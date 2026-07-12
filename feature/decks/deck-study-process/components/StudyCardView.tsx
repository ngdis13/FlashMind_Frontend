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
 * Пропсы для компонента StudyCardView
 * @interface Props
 * @property {StudyCard | undefined} card - Данные карточки для изучения
 * @property {boolean} isFirstCard - Флаг, является ли карточка первой в колоде
 */
interface Props {
  card: StudyCard | undefined;
  isFirstCard: boolean;
}

/**
 * Компонент для отображения карточки в режиме изучения
 * 
 * @component
 * @param {Props} props - Свойства компонента
 * @param {StudyCard | undefined} props.card - Данные карточки для изучения
 * @param {boolean} props.isFirstCard - Флаг первой карточки (для показа подсказки)
 * @returns {JSX.Element} React компонент карточки для изучения
 * 
 * @description
 * Компонент отображает карточку с возможностью переворота (3D анимация):
 * - Передняя сторона: вопрос (front) с индикатором сложности
 * - Задняя сторона: ответ (back)
 * - Индикатор сложности в виде 5 точек (цвет зависит от уровня)
 * - Подсказка "Нажми, чтобы перевернуть" для первой карточки
 * - ИИ-подсказка при клике на точки сложности (автоскрытие через 3 сек)
 * - Поддержка длинного текста через ScrollView
 * 
 * @example
 * // Использование компонента
 * <StudyCardView 
 *   card={currentCard}
 *   isFirstCard={index === 0}
 * />
 */
export const StudyCardView = ({ card, isFirstCard }: Props) => {
  // --------------------------- Состояния ---------------------------
  /**
   * Флаг переворота карточки
   */
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  
  /**
   * Флаг, была ли карточка перевернута хотя бы раз
   */
  const [wasFlipped, setWasFlipped] = useState<boolean>(false);
  
  /**
   * Управление видимостью ИИ-подсказки
   */
  const [showUserHint, setShowUserHint] = useState<boolean>(false);

  // --------------------------- Анимации ---------------------------
  /**
   * Анимация переворота карточки (0 - передняя, 1 - задняя)
   */
  const flipAnim = useRef(new Animated.Value(0)).current;
  
  /**
   * Анимация прозрачности подсказки "Нажми, чтобы перевернуть"
   */
  const hintOpacity = useRef(new Animated.Value(0)).current;

  // --------------------------- Рефы ---------------------------
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --------------------------- Вспомогательные функции ---------------------------
  /**
   * Определяет уровень сложности карточки
   * Округляет дробное значение до целого числа в диапазоне 1-5
   * 
   * @returns {number} Уровень сложности (1-5)
   */
  const getDifficultyLevel = (): number => {
    if (!card?.difficulty) return 0;
    if ((card.difficulty as unknown) === "none") return 0;

    const parsed = Number(card.difficulty);
    if (isNaN(parsed)) return 0;

    const rounded = Math.round(parsed);
    return Math.max(1, Math.min(5, rounded));
  };

  const difficultyLevel = getDifficultyLevel();

  /**
   * Определяет цвет для активных точек сложности
   * 
   * @param {number} level - Уровень сложности (1-5)
   * @returns {string} HEX-код цвета
   * 
   * @description
   * Цветовая схема:
   * - 1: #6BC770 (светло-зеленый)
   * - 2: #7EE083 (зеленый)
   * - 3: #FFDA62 (желтый)
   * - 4: #FFA162 (оранжевый)
   * - 5: #FF5151 (красный)
   */
  const getDifficultyColor = (level: number): string => {
    if (level <= 1) return "#6BC770";
    if (level === 2) return "#7EE083";
    if (level === 3) return "#FFDA62";
    if (level === 4) return "#FFA162";
    return "#FF5151";
  };

  // --------------------------- Обработчики ---------------------------
  /**
   * Переключает видимость ИИ-подсказки с автоскрытием через 3 секунды
   */
  const handleDotsPress = (): void => {
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

  /**
   * Закрывает ИИ-подсказку вручную
   */
  const handleCloseHint = (): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowUserHint(false);
  };

  /**
   * Переворачивает карточку с анимацией
   */
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

  // --------------------------- Effects ---------------------------
  /**
   * Очищает таймер при размонтировании компонента
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /**
   * Управляет анимацией подсказки "Нажми, чтобы перевернуть"
   * Показывает только для первой карточки, которая еще не была перевернута
   */
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

  /**
   * Сбрасывает состояние при смене карточки
   */
  useEffect(() => {
    setIsFlipped(false);
    flipAnim.setValue(0);
    setShowUserHint(false);
  }, [card?.id]);

  // --------------------------- Интерполяции ---------------------------
  /**
   * Поворот передней стороны карточки
   */
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  /**
   * Поворот задней стороны карточки
   */
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  /**
   * Прозрачность передней стороны при перевороте
   */
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [1, 0],
  });

  /**
   * Прозрачность задней стороны при перевороте
   */
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [0, 1],
  });

  // --------------------------- Вспомогательный рендер ---------------------------
  /**
   * Рендерит массив из 5 точек сложности с кликабельной оберткой
   * 
   * @returns {JSX.Element} Компонент с точками сложности
   */
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

  // --------------------------- Отрисовка ---------------------------
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

// --------------------------- Стили ---------------------------
/**
 * Стили для компонента StudyCardView
 * @constant
 */
const styles = StyleSheet.create({
  /**
   * Стиль контейнера карточки
   */
  container: { 
    flex: 1, 
    marginBottom: 24,
    width: '100%',
    minWidth: 370,
    alignSelf: 'center', // Центрирование
  },
  /**
   * Стиль области нажатия для переворота
   */
  touchArea: { 
    flex: 1,
    width: '100%',
  },
  /**
   * Стиль карточки (общий для обеих сторон)
   */
  card: { 
    flex: 1, 
    backfaceVisibility: "hidden", 
    paddingBottom: 20,
    width: '100%',
  },
  /**
   * Стиль передней стороны карточки
   */
  cardFront: { 
    backgroundColor: "#FFFFFF", 
    position: "relative",
    width: '100%',
  },
  /**
   * Стиль задней стороны карточки
   */
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
  /**
   * Стиль контента внутри ScrollView
   */
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 20,
    width: '100%',
  },
  /**
   * Стиль основного текста карточки
   */
  mainText: { 
    textAlign: "center",
    width: '100%',
  },
  /**
   * Стиль подсказки внутри карточки
   */
  hintTextInside: { 
    textAlign: "center", 
    paddingBottom: 10,
    width: '100%',
  },
  /**
   * Стиль области нажатия на точки сложности
   */
  dotsPressArea: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    zIndex: 101,
  },
  /**
   * Стиль контейнера точек сложности
   */
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  /**
   * Стиль отдельной точки сложности
   */
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5, 
  },
  /**
   * Стиль абсолютно позиционированной подсказки
   */
  absoluteHint: {
    position: "absolute",
    top: 36,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 999,
  },
});