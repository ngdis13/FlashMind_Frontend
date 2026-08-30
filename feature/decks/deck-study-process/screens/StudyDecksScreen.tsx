// --------------------------- React ---------------------------
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";

// --------------------------- React Native ---------------------------
import {
  Pressable,
  View,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";

import { useUserStore } from "@/store/userStore";

// --------------------------- Expo ---------------------------
import { useLocalSearchParams, useRouter } from "expo-router";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-study-process/styles/StudyDecksScreen.styles";

// --------------------------- Компоненты ---------------------------
import { Logo } from "@/components/Logo";
import { StudyCardView } from "@/feature-decks/deck-study-process/components/StudyCardView";
import { RatingButton } from "@/feature-decks/deck-study-process/components/RatingButton";

// --------------------------- Ассеты ---------------------------
import ReturnIcon from "@/assets/icons/ReturnIcon.png";

// --------------------------- API ---------------------------
import {
  newToStudy,
  reviewCard,
} from "@/feature-decks/deck-study-process/api/api";
import { Card } from "@/storage/types/types";

// --------------------------- Хуки и хранилища ---------------------------
import { useDecks } from "@/storage/hooks/useDecks";
import { useCards } from "@/storage/hooks/useCards";
import { useDeckStore } from "@/store/deck.store";
import { useCardStore } from "@/store/card.store";

// --------------------------- Вспомогательные функции ---------------------------
/**
 * Форматирует время в миллисекундах в читаемый вид
 *
 * @param {number} ms - Время в миллисекундах
 * @returns {string} Отформатированное время (например, "5 мин. 30 сек." или "45 сек.")
 */
const formatTotalTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} сек.`;
  }
  return `${minutes} мин. ${seconds} сек.`;
};

/**
 * Экран процесса изучения карточек в колоде
 *
 * @component
 * @returns {JSX.Element} React компонент экрана изучения
 *
 * @description
 * Экран предоставляет:
 * - Пошаговое изучение карточек с переворотом
 * - Оценка сложности карточки (4 уровня: Забыл, Сложно, Хорошо, Легко)
 * - Анимация перехода между карточками
 * - Таймер обучения (общее время и время на каждую карточку)
 * - Индикатор прогресса (текущая карточка / всего)
 * - Обновление статуса колоды после завершения
 * - Отображение итогового времени обучения
 *
 * @example
 * // Использование в навигации с параметрами
 * router.push(`/decks/${deckId}/study?addCount=10`)
 */
export default function StudyDecksScreen() {
  const router = useRouter();
  const { id, addCount } = useLocalSearchParams<{
    id: string;
    addCount: string;
  }>();
  const count = parseInt(addCount || "0", 10);

  const [cards, setCards] = useState<Card[]>([]);
  const [totalToStudy, setTotalToStudy] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [finishedCount, setFinishedCount] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { decks } = useDecks();
  const { invalidateDeckCards } = useCards();

  const deck = decks.find((d) => d.id === id);

  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());
  const [totalSessionTimeStr, setTotalSessionTimeStr] = useState<string>("");

  const { incrementDailyReviews } = useUserStore();

  useEffect(() => {
    if (!loading && cards.length === 0 && totalToStudy > 0) {
      const totalMs = Date.now() - sessionStartTime.current;
      setTotalSessionTimeStr(formatTotalTime(totalMs));
    }
  }, [cards, loading, totalToStudy]);

  useEffect(() => {
    if (cards.length > 0) {
      setCardStartTime(Date.now());
    }
  }, [cards]);

  useEffect(() => {
    const startStudy = async (): Promise<void> => {
      if (!id) return;
      try {
        // v2.0.0: due-карточки на сегодня — из cards_on_study колоды
        const currentDeck = useDeckStore
          .getState()
          .decksState?.decks.find((d) => d.id === id);
        const dueCards = currentDeck?.cards_on_study ?? [];

        // v2.0.0: POST /study возвращает только НОВЫЕ карточки
        let newCards: Card[] = [];
        if (count > 0) {
          newCards = await newToStudy(id, count);
        }

        // Очередь сессии: сначала карточки к повторению, потом новые
        const queue = [...dueCards, ...newCards];
        setCards(queue);
        setTotalToStudy(queue.length);

        // Новые карточки теперь в обучении — фиксируем в сторе колоды
        if (newCards.length > 0) {
          useDeckStore.getState().addCardsToStudy(id, newCards);
        }
      } catch (e) {
        console.error("Ошибка загрузки:", e);
      } finally {
        setLoading(false);
      }
    };
    startStudy();
  }, [id, count]);

  const handleBack = (): void => {
    if (id) {
      console.log(`Выход из обучения. Инвалидируем кэш карточек колоды ${id}`);
      invalidateDeckCards(id);
    }
    router.push(`/decks/${id}/study`);
  };

  const handleRate = useCallback(
    async (rating: number): Promise<void> => {
      if (cards.length === 0 || isSubmitting) return;

      const currentCard = cards[0];
      setIsSubmitting(true);

      const durationMs = Date.now() - cardStartTime;
      console.log("время ответа", durationMs);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(async () => {
        try {
          await incrementDailyReviews();
          console.log("📊 Статистика профиля обновлена после успешного ответа");

          // v2.0.0: всегда 200 + { card, success } (204 больше не используется)
          const response = await reviewCard(
            currentCard.id,
            rating as 1 | 2 | 3 | 4,
            durationMs,
          );

          if (response.success) {
            // v2.0.0: карточка прошла повтор — уходит из очереди сессии
            setCards((prev) => prev.slice(1));
            setFinishedCount((prev) => prev + 1);
            if (id) {
              // Убираем карточку из cards_on_study колоды.
              // Внутри уже декрементится repeat_cards, поэтому отдельный
              // updateDeckReviewCount("decrement") больше не нужен
              useDeckStore.getState().removeCardFromStudy(id, currentCard.id);
              // П.14 спецификации: обновляем карточку в кэше по ID,
              // кэш НЕ инвалидируем
              useCardStore.getState().replaceCard(id, response.card);
            }
          } else {
            // success=false — карточку нужно показать снова сегодня
            setCards((prev) => [...prev.slice(1), response.card]);
            if (id) {
              // П.14: карточка остаётся в обучении, но её SRS-данные
              // (difficulty/stability) обновились — синхронизируем кэш
              useCardStore.getState().replaceCard(id, response.card);
            }
          }
        } catch (error) {
          console.error("❌ Ошибка при обработке карточки:", error);
          setCards((prev) => {
            const updated = [...prev];
            const failed = updated.shift();
            if (failed) updated.push(failed);
            return updated;
          });
        } finally {
          setIsSubmitting(false);
          slideAnim.setValue(100);
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    },
    [
      cards,
      isSubmitting,
      fadeAnim,
      slideAnim,
      cardStartTime,
      id,
      incrementDailyReviews,
    ],
  );

  const keyboardStateRef = useRef({ cards, isSubmitting, handleRate });
  keyboardStateRef.current = { cards, isSubmitting, handleRate };

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const {
        cards: currentCards,
        isSubmitting: currentSubmitting,
        handleRate: currentHandleRate,
      } = keyboardStateRef.current;
      if (currentCards.length === 0 || currentSubmitting) return;

      const rates: Record<string, number> = { "1": 1, "2": 2, "3": 3, "4": 4 };
      const rate = rates[e.key];

      if (rate) {
        e.preventDefault();
        currentHandleRate(rate);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentIndex = useMemo(() => {
    return Math.min(finishedCount + 1, totalToStudy);
  }, [finishedCount, totalToStudy]);

  // --------------------------- Отрисовка ---------------------------
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <View
          style={{
            flex: 1,
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 20,
            maxHeight: 800,
          }}
        >
          <View style={styles.header}>
            <Pressable onPress={handleBack}>
              <Image source={ReturnIcon} style={{ width: 12, height: 22 }} />
            </Pressable>
            <Typography variant="h1">{deck?.name || "Изучение"}</Typography>
          </View>

          <View style={styles.counter}>
            <Typography variant="h2">
              {loading ? "Загрузка..." : `${currentIndex} / ${totalToStudy}`}
            </Typography>
          </View>

          {loading ? (
            <ActivityIndicator size="large" style={{ flex: 1 }} />
          ) : cards.length > 0 ? (
            <Animated.View
              style={{
                flex: 1,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                width: "100%",
                paddingHorizontal: 120,
              }}
            >
              <StudyCardView
                card={cards[0]}
                isFirstCard={finishedCount === 0}
              />
            </Animated.View>
          ) : (
            <Pressable
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                width: "100%",
              }}
              onPress={handleBack}
            >
              <Logo size={174} />
              <Typography variant="h1" style={{ textAlign: "center" }}>
                Молодец! На сегодня всё!
              </Typography>

              <Typography
                variant="h3"
                color={colors.darkGray}
                style={{ textAlign: "center", marginBottom: 12 }}
              >
                Ты изучил все карточки в этой колоде
              </Typography>
              {totalSessionTimeStr ? (
                <View
                  style={{
                    alignSelf: "center",
                    backgroundColor: colors.lightGray || "#F5F5F5",
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    borderRadius: 100,
                    marginBottom: 24,
                  }}
                >
                  <Typography
                    variant="h3"
                    color={colors.darkMainColor}
                    style={{
                      textAlign: "center",
                      fontWeight: "500",
                      letterSpacing: 0.3,
                    }}
                  >
                    ⏱ Время обучения: {totalSessionTimeStr}
                  </Typography>
                </View>
              ) : null}
            </Pressable>
          )}
        </View>

        {cards.length > 0 && (
          <View
            style={[
              styles.buttonBox,
              { width: "100%", paddingHorizontal: 10, paddingBottom: 30 },
            ]}
          >
            <RatingButton
              label="Забыл"
              colorStyle={styles.redButton}
              onPress={() => handleRate(1)}
              disabled={isSubmitting}
            />
            <RatingButton
              label="Сложно"
              colorStyle={styles.yellowButton}
              onPress={() => handleRate(2)}
              disabled={isSubmitting}
            />
            <RatingButton
              label="Хорошо"
              colorStyle={styles.lightGreenButton}
              onPress={() => handleRate(3)}
              disabled={isSubmitting}
            />
            <RatingButton
              label="Легко"
              colorStyle={styles.darkGreenButton}
              onPress={() => handleRate(4)}
              disabled={isSubmitting}
            />
          </View>
        )}
      </View>
    </View>
  );
}
