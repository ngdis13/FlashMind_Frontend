import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image, Modal, Animated } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";

import { useDecks } from "@/storage/hooks/useDecks";
import { useCards } from "@/storage/hooks/useCards";
import type { Card } from "@/storage/types/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "@/feature-decks/deck-study/styles/StudyDecks.styles";
import { MainButton } from "@/components/MainButton";
import { useEffect, useState } from "react";
import { colors } from "@/styles/Colors";
import { AxiosError } from "axios";

// Донат «к повтору сегодня»
import RepeatTodayDonut from "@/feature-decks/deck-study/components/RepeatTodayDonut";

// AI-инсайты (перенесены из статистики)
import AiInsightsButton from "@/feature-decks/deck-study/components/AiInsightsButton";
import { AiInsightsScreen } from "@/feature-decks/deck-study/components/AiInsightsScreen";
import {
  AiModal,
  InsufficientReviewsData,
} from "@/feature-decks/deck-study/components/AiModal";
import {
  analyzeStudyStat,
  StudyStatAnalyzeResponse,
} from "@/feature-decks/deck-study/api/aiApi";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";

const SMOOTH_TIMING_CONFIG = {
  duration: 280,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

export default function StudyDecksScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decks } = useDecks();
  const deck = decks.find((d) => d.id === id);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Начальная прозрачность 0


  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiData, setAiData] = useState<StudyStatAnalyzeResponse | null>(null);
  const [aiError, setAiError] = useState<InsufficientReviewsData | null>(null);
  const [isAiErrorModal, setIsAiErrorModal] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);

  const [addCount, setAddCount] = useState(0);
  const [deckCards, setDeckCards] = useState<Card[]>([]);

  const { getDeckCards, invalidateDeckCards } = useCards();

  // Карточки колоды для точного подсчёта: кэш, при устаревании — сеть.
  // Если состав кэша расходится с total_cards — кэш устарел,
  // однократно перезагружаем карточки с сервера.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const refetched = { done: false };
    (async () => {
      try {
        let cards = await getDeckCards(id);
        const expected = deck?.total_cards ?? 0;
        if (
          !refetched.done &&
          cards.length > 0 &&
          expected > 0 &&
          cards.length !== expected
        ) {
          refetched.done = true;
          console.log(
            `⚠️ Рассинхрон: карточек в кэше ${cards.length}, total_cards ${expected} — перезагружаем`,
          );
          invalidateDeckCards(id);
          cards = await getDeckCards(id);
        }
        if (!cancelled) setDeckCards(cards);
      } catch (e) {
        console.error("Не удалось загрузить карточки колоды:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, getDeckCards, invalidateDeckCards, deck?.total_cards]);

  // v2.0.0: GET /study удалён — счётчики считаем из данных колоды.
  // ВАЖНО: cards_on_study — это due-карточки НА СЕГОДНЯ, а не «все в обучении»:
  // после успешного ревью карточка уходит из cards_on_study, оставаясь in_learning.
  // Новые = реальные карточки колоды, ещё не в изучении и не приостановленные.
  // НЕ вычитаем из total_cards: он приходит из кэша списка колод и может отставать.
  const newCard = deckCards.filter(
    (c) => !c.in_learning && !c.is_suspended,
  ).length;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isTooltipVisible ? 1 : 0, // 1 если виден, 0 если скрыт
      duration: 300, // Длительность в мс
      useNativeDriver: true, // Обязательно для производительности
    }).start();
  }, [isTooltipVisible]);

  const handleBack = () => {
    router.push(`/decks`);
  };

  const handleStartStudy = () => {
    router.push({
      pathname: `/decks/${id}/study/process`,
      params: { addCount: addCount },
    });
  };

  // Дефолтное количество новых карточек к добавлению (как раньше — до 5)
  useEffect(() => {
    setAddCount(Math.min(5, newCard));
  }, [newCard]);



  /** Плавный выезд AI-экрана снизу */
  const aiTranslateY = useSharedValue(400);
  const aiOpacity = useSharedValue(0);

  const openAiModal = () => {
    setIsAiModalVisible(true);
    aiTranslateY.value = withTiming(0, SMOOTH_TIMING_CONFIG);
    aiOpacity.value = withTiming(1, SMOOTH_TIMING_CONFIG);
  };

  const closeAiModal = () => {
    aiTranslateY.value = withTiming(400, SMOOTH_TIMING_CONFIG);
    aiOpacity.value = withTiming(0, SMOOTH_TIMING_CONFIG, (finished) => {
      if (finished) runOnJS(setIsAiModalVisible)(false);
    });
  };

  const aiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: aiTranslateY.value }],
    opacity: aiOpacity.value,
  }));

  /** Запуск AI-анализа по конкретной колоде */
  const handleAiInsights = async () => {
    if (!id) return;
    setIsAiLoading(true);
    try {
      const result = await analyzeStudyStat(id);
      setAiData(result);
      openAiModal();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 422) {
        setAiError(err.response.data as InsufficientReviewsData);
        setIsAiErrorModal(true);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

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
          }}
        >
          <View style={[styles.mainContent, { width: "100%" }]}>
            <View style={commonStyles.screenHeader}>
              <Pressable
                onPress={handleBack}
                style={commonStyles.backButton}
                hitSlop={20}
              >
                <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
              </Pressable>
              <Typography variant="h2">{deck?.name}</Typography>
            </View>

            <View
              style={[commonStyles.mainBox, { gap: 20 }, styles.infoBox]}
            >
              {/* График «к повтору сегодня» с легендой */}
              <RepeatTodayDonut
                dueCards={deck?.cards_on_study ?? []}
                newCount={addCount}
              />
            </View>

            {/* Кнопка AI-инсайтов — анализ по этой колоде */}
            <AiInsightsButton
              onPress={handleAiInsights}
              isLoading={isAiLoading}
              disabled={!deck}
            />
          </View>
        </View>

      </View>
      <View style={styles.startButton}>
        <MainButton
          style={{ width: "100%" }}
          title="Старт"
          onPress={handleStartStudy}
          disabled={!deck || (deck?.repeat_cards ?? 0) + addCount === 0}
        />
      </View>

      {/* Полноэкранная модалка AI Insights с плавным выездом */}
      <Modal
        visible={isAiModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeAiModal}
      >
        <View style={styles.aiModalOverlay}>
          <Reanimated.View style={[styles.aiModalContent, aiAnimatedStyle]}>
            {aiData && <AiInsightsScreen data={aiData} onBack={closeAiModal} />}
          </Reanimated.View>
        </View>
      </Modal>

      {/* Модалка «Недостаточно данных» (ошибка 422) */}
      <AiModal
        visible={isAiErrorModal}
        onClose={() => setIsAiErrorModal(false)}
        data={aiError}
      />
    </View>
  );
}
