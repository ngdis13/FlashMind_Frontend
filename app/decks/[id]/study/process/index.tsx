import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import {
  Pressable,
  View,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useDecks } from "@/storage/hooks/useDecks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./style/styles";
import { useEffect, useState, useMemo, useRef, useCallback } from "react"; // Добавили useCallback
import { colors } from "@/styles/Colors";
import { StudyCardView } from "./components/cardView";
import { getStudyCard, postCardRating, StudyCard } from "./api/api";
import { Logo } from "@/components/Logo";
import React from "react";
import { RatingButton } from "./components/RatingButton";

// Вспомогательная функция для форматирования миллисекунд в читаемый вид
const formatTotalTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} сек.`;
  }
  return `${minutes} мин. ${seconds} сек.`;
};

export default function StudyDecksScreen() {
  const router = useRouter();
  const { id, addCount } = useLocalSearchParams<{
    id: string;
    addCount: string;
  }>();
  const count = parseInt(addCount || "0", 10);

  const [cards, setCards] = useState<StudyCard[]>([]);
  const [totalToStudy, setTotalToStudy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finishedCount, setFinishedCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { decks } = useDecks();
  const deck = decks.find((d) => d.id === id);

  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now()); //время начало сессии обучения
  const [totalSessionTimeStr, setTotalSessionTimeStr] = useState<string>(""); //финальное время сессии

  const handleBack = () => router.push(`/decks/${id}/study`);

  useEffect(() => {
    // Если загрузка завершена и карточек больше нет — значит, пользователь всё прошел
    if (!loading && cards.length === 0 && totalToStudy > 0) {
      const totalMs = Date.now() - sessionStartTime.current;
      setTotalSessionTimeStr(formatTotalTime(totalMs));
    }
  }, [cards, loading, totalToStudy]);

  useEffect(() => {
    if (cards.length > 0) {
      setCardStartTime(Date.now);
    }
  }, [cards]);

  useEffect(() => {
    const startStudy = async () => {
      if (!id) return;
      try {
        const data = await getStudyCard(id, count);
        if (data && data.cards) {
          setCards(data.cards);
          setTotalToStudy(data.cards.length);
        }
      } catch (e) {
        console.error("Ошибка загрузки:", e);
      } finally {
        setLoading(false);
      }
    };
    startStudy();
  }, [id, count]);

  const handleRate = useCallback(
    async (rating: number) => {
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
    [cards, isSubmitting, fadeAnim, slideAnim, cardStartTime],
  ); // Зависимости функции

  const currentIndex = useMemo(() => {
    return Math.min(finishedCount + 1, totalToStudy);
  }, [finishedCount, totalToStudy]);

  return (
    // 1. Внешняя фоновая подложка на весь экран ПК
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        {/* 3. ИСПРАВЛЕНИЕ: Ограничиваем ширину верхней части контента */}
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
              <ActivityIndicator
                size="large"
                style={{ flex: 1 }}
                color={colors.primary}
              />
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
                      style={{ textAlign: "center", fontWeight: "500", letterSpacing: 0.3, }}
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
