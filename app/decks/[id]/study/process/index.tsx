import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image, ActivityIndicator, Animated } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useDecks } from "@/storage/hooks/useDecks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./style/styles";
import { useEffect, useState, useMemo, useRef } from "react";
import { colors } from "@/styles/Colors";
import { StudyCardView } from "./components/cardView";
import { getStudyCard, postCardRating, StudyCard } from "./api/api";
import { Logo } from '@/components/Logo'
import React from "react";

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

  // --- АНИМАЦИИ ---
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { decks } = useDecks();
  const deck = decks.find((d) => d.id === id);

  const handleBack = () => router.back();

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

  const handleRate = async (rating: number) => {
    if (cards.length === 0 || isSubmitting) return;

    const currentCard = cards[0];
    setIsSubmitting(true);

    // Анимация ухода карточки вверх
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -100, duration: 250, useNativeDriver: true }),
    ]).start(async () => {
      try {
        const response = await postCardRating(currentCard.id, rating);

        if (response?.status === 200) {
          const updatedCard = response.data;
          setCards((prev) => {
            const remaining = prev.slice(1);
            return [...remaining, updatedCard];
          });
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
        // Сброс позиции для новой карточки (появляется снизу)
        slideAnim.setValue(100);
        Animated.parallel([
          Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    });
  };

  const currentIndex = useMemo(() => {
    return Math.min(finishedCount + 1, totalToStudy);
  }, [finishedCount, totalToStudy]);

  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
      <View style={[commonStyles.mainContent, { flex: 1 }]}>
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
          <ActivityIndicator size="large" style={{ flex: 1 }} color={colors.primary} />
        ) : cards.length > 0 ? (
          <Animated.View 
            style={{ 
              flex: 1, 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }}
          >
            <StudyCardView card={cards[0]} isFirstCard={finishedCount === 0}/>
          </Animated.View>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Logo size={174}/>
            <Typography variant="h1" style={{ textAlign: "center" }}>
              Молодец! На сегодня всё!
            </Typography>
            <Typography variant="h3" color={colors.darkGray} style={{ textAlign: "center" }}>
              Ты изучил все карточки в этой колоде
            </Typography>
          </View>
        )}
      </View>

      <View style={[styles.buttonBox, { opacity: isSubmitting ? 0.5 : 1 }]}>
        {[
          { label: "Забыл", val: 1, color: styles.redButton },
          { label: "Сложно", val: 2, color: styles.yellowButton },
          { label: "Хорошо", val: 3, color: styles.lightGreenButton },
          { label: "Легко", val: 4, color: styles.darkGreenButton },
        ].map((btn) => (
          <Pressable
            key={btn.val}
            onPress={() => handleRate(btn.val)}
            disabled={isSubmitting || cards.length === 0}
          >
            <View style={[btn.color, styles.ratingButton]}>
              <Typography variant="h3" color={colors.darkColor}>
                {btn.label}
              </Typography>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
