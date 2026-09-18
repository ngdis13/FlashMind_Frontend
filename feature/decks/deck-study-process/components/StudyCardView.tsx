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
import { HtmlText } from "@/feature-decks/deck-create-card/components/HtmlText";

// --------------------------- Хуки ---------------------------
import { useCardScale } from "@/utils/hooks/useCardScale";

// --------------------------- Типы и хелперы ---------------------------
import { Card } from "@/storage/types/types";
import { blocksToHtml } from "@/utils/helpers/blocksToHtml";

interface Props {
  card: Card | undefined;
  isFirstCard: boolean;
}

export const StudyCardView = ({ card, isFirstCard }: Props) => {
  const { width: windowWidth } = useWindowDimensions();
  // Десктоп (≥768px): прежний «большой» вид карточки (95% ширины, flex-высота).
  // Мобильные: фикс 372×520, как в редакторе/превью
  const isWide = windowWidth >= CARD_DISPLAY.WIDE_SCREEN_MIN_WIDTH;
  // Коэффициент масштабирования КОНТЕНТА КАРТОЧКИ: 1 на телефонах (мобильный
  // дизайн не меняется), до 1.35 на планшетах/десктопе.
  // Шрифты — через scaledText (мягче, до +20%), точки сложности — статичны
  const { textScale, scaled, scaledText } = useCardScale();
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

  // Динамические стили карточки: пересоздаются только при смене scale.
  // На мобильных (scale = 1) значения равны эталонным — дизайн не меняется,
  // на планшетах/десктопе контент растёт внутри контейнера 650×750
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
          // Контент по центру вертикали карточки
          justifyContent: "center",
          // Паддинги — зеркало .editor-input { padding: 16px 14px }
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

  const renderCardContent = (html: string) => (
    <ScrollView
      contentContainerStyle={dynamicStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {html ? (
        <HtmlText
          html={html}
          // Базовый шрифт термина/описания: 18 → 22 на десктопе
          // (текст растёт мягче контейнера — до +20%)
          fontSize={scaledText(CARD_DISPLAY.fontSize)}
          // textScale — чтобы внутренние заголовки h1–h3 контента
          // росли пропорционально базовому тексту
          scale={textScale}
        />
      ) : null}
    </ScrollView>
  );

  return (
    <View
      style={[
        dynamicStyles.container,
        isWide
          ? {
              // Десктоп: контейнер ограничен maxWidth 650 и отцентрован
              // (alignSelf в dynamicStyles.container),
              // контент внутри масштабируется через scaled()
              width: CARD_DISPLAY.desktopMaxWidth,
              maxWidth: "100%",
              height: CARD_DISPLAY.desktopHeight,
              maxHeight: "100%",
            }
          : {
              // Мобильные: при scale = 1 это ровно эталонные 372×520
              width: scaled(CARD_DISPLAY.width),
              height: scaled(CARD_DISPLAY.height),
            },
      ]}
    >
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
            style={dynamicStyles.absoluteHint}
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

// Статичные стили, не зависящие от масштаба экрана.
// Все размеры контента (паддинги, точки, отступы, шрифт) вынесены
// в dynamicStyles внутри компонента — они масштабируются через scaled()
const styles = StyleSheet.create({
  // Точки сложности НЕ масштабируются — эталонный мобильный размер
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
