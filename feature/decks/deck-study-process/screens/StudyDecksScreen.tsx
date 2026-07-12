// --------------------------- React ---------------------------
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";

// --------------------------- React Native ---------------------------
import {
  Pressable,
  View,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";

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
import { getStudyCard, postCardRating, StudyCard } from "@/feature-decks/deck-study-process/api/api";

// --------------------------- Хуки и хранилища ---------------------------
import { useDecks } from "@/storage/hooks/useDecks";
import { useCards } from "@/storage/hooks/useCards";
import { useDeckStore } from "@/store/deck.store";

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
  // --------------------------- Навигация и параметры ---------------------------
  const router = useRouter();
  const { id, addCount } = useLocalSearchParams<{
    id: string;
    addCount: string;
  }>();
  const count = parseInt(addCount || "0", 10);

  // --------------------------- Состояния ---------------------------
  /**
   * Список карточек для изучения
   */
  const [cards, setCards] = useState<StudyCard[]>([]);
  
  /**
   * Общее количество карточек для изучения
   */
  const [totalToStudy, setTotalToStudy] = useState<number>(0);
  
  /**
   * Флаг загрузки карточек
   */
  const [loading, setLoading] = useState<boolean>(true);
  
  /**
   * Флаг отправки оценки (блокировка кнопок)
   */
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  /**
   * Количество пройденных карточек
   */
  const [finishedCount, setFinishedCount] = useState<number>(0);

  // --------------------------- Анимации ---------------------------
  /**
   * Анимация прозрачности при смене карточки
   */
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  /**
   * Анимация слайда при смене карточки
   */
  const slideAnim = useRef(new Animated.Value(0)).current;

  // --------------------------- Хуки ---------------------------
  const { decks } = useDecks();
  const { invalidateDeckCards } = useCards();

  /**
   * Текущая колода из стора
   */
  const deck = decks.find((d) => d.id === id);

  // --------------------------- Таймеры ---------------------------
  /**
   * Время начала ответа на текущую карточку
   */
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  
  /**
   * Время начала сессии обучения
   */
  const sessionStartTime = useRef<number>(Date.now());
  
  /**
   * Итоговое время сессии (строка)
   */
  const [totalSessionTimeStr, setTotalSessionTimeStr] = useState<string>("");

  // --------------------------- Effects ---------------------------
  /**
   * Обновляет итоговое время сессии, когда все карточки пройдены
   */
  useEffect(() => {
    // Если загрузка завершена и карточек больше нет — значит, пользователь всё прошел
    if (!loading && cards.length === 0 && totalToStudy > 0) {
      const totalMs = Date.now() - sessionStartTime.current;
      setTotalSessionTimeStr(formatTotalTime(totalMs));
    }
  }, [cards, loading, totalToStudy]);

  /**
   * Устанавливает время начала ответа при появлении новой карточки
   */
  useEffect(() => {
    if (cards.length > 0) {
      setCardStartTime(Date.now);
    }
  }, [cards]);

  /**
   * Загружает карточки для изучения при монтировании компонента
   */
  useEffect(() => {
    const startStudy = async (): Promise<void> => {
      if (!id) return;
      try {
        const data = await getStudyCard(id, count);
        if (data && data.cards) {
          setCards(data.cards);
          setTotalToStudy(data.cards.length);
          // Передаем id колоды и реальную длину массива, который только что скачали
          useDeckStore.getState().updateDeckReviewCount(id, data.cards.length);
        }
      } catch (e) {
        console.error("Ошибка загрузки:", e);
      } finally {
        setLoading(false);
      }
    };
    startStudy();
  }, [id, count]);

  // --------------------------- Обработчики ---------------------------
  /**
   * Возвращает на экран подготовки к изучению
   */
  const handleBack = (): void => {
    router.push(`/decks/${id}/study`);
  };

  /**
   * Обрабатывает оценку карточки пользователем
   * 
   * @param {number} rating - Оценка сложности (1-4)
   * @async
   * 
   * @description
   * Процесс:
   * 1. Записывает время ответа
   * 2. Запускает анимацию ухода карточки
   * 3. Отправляет оценку на сервер
   * 4. Инвалидирует кэш колоды
   * 5. Обновляет счетчик изученных карточек в сторе
   * 6. Переходит к следующей карточке с анимацией
   */
  const handleRate = useCallback(
    async (rating: number): Promise<void> => {
      if (cards.length === 0 || isSubmitting) return;

      const currentCard = cards[0];
      setIsSubmitting(true);

      const durationMs = Date.now() - cardStartTime; //время ответа
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
          // Вызывается строго ПОСЛЕ КАЖДОЙ карточки.
          // Как только пользователь нажал кнопку рейтинга — мы сразу помечаем колоду как неактуальную.
          if (id) {
            console.log(
              `Карточка оценена. Инвалидируем колоду ${id} (isActual -> false)`,
            );
            invalidateDeckCards(id);
          }

          const response = await postCardRating(
            currentCard.id,
            rating,
            durationMs,
          );
          if (response?.status === 200) {
            const updatedCard = response.data;
            setCards((prev) => [...prev.slice(1), updatedCard]);
          } else {
            setCards((prev) => prev.slice(1));
            setFinishedCount((prev) => prev + 1);
            // Карточка успешно пройдена и удалена из списка текущей сессии.
            // Посылаем сигнал декремента счетчика repeat_cards в стор колод на главной!
            if (id) {
              useDeckStore.getState().updateDeckReviewCount(id, "decrement");
            }
          }
        } catch (error) {
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
      invalidateDeckCards,
    ],
  );

  // --------------------------- Вычисления ---------------------------
  /**
   * Текущий индекс карточки (для отображения прогресса)
   */
  const currentIndex = useMemo(() => {
    return Math.min(finishedCount + 1, totalToStudy);
  }, [finishedCount, totalToStudy]);

  // --------------------------- Отрисовка ---------------------------
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <View
          style={[
            commonStyles.content,
            { flex: 1, justifyContent: "flex-start", width: "100%" },
          ]}
        >
          <View
            style={[
              commonStyles.mainContent,
              { flex: 1, width: "100%", marginTop: 16 },
            ]}
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
        </View>

        {cards.length > 0 && (
          <View
            style={[styles.buttonBox, { width: "100%", paddingHorizontal: 10 }]}
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