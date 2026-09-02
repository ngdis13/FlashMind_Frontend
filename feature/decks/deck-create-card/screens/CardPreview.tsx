import { useState, useEffect } from "react";
import { ScrollView, View, Image, Pressable, Platform, useWindowDimensions } from "react-native";

import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-create-card/styles/CardPreview";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import viewCardIcon from "@/assets/icons/viewCardIcon.png";
import editCardIcon from "@/assets/icons/editCardIcon.png";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCards } from "@/storage/hooks/useCards";
import infoIcon from "@/assets/icons/IconInfo.png";
import { CustomSwitch } from "@/components/CustomSwitch";
import { PreviewModal } from "@/feature-decks/deck-create-card/components/PreviewModal";
import { CardDetailResponse } from "@/storage/types/types";
import { fetchCardById } from "@/storage/api/api";

import IconTimeMetrics from "@/assets/icons/cardPreview/IconTimeMetrics.png";
import IconChartMetrics from "@/assets/icons/cardPreview/IconChartMetrics.png";
import IconRepeatsMetrics from "@/assets/icons/cardPreview/IconRepeatsMetrics.png";
import IconDifficultyMetrics from "@/assets/icons/cardPreview/IconDifficultyMetrics.png";

// ДД.ММ из ISO-строки (без Intl — одинаково на Hermes и web)
const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// «4 мин 20 сек» из миллисекунд
const formatDuration = (ms: number): string => {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min} мин ${sec} сек` : `${sec} сек`;
};

export default function CardPreview() {
  const router = useRouter();
  const {
    id: routeId,
    deckId,
    cardId: paramCardId,
  } = useLocalSearchParams<{
    id?: string;
    deckId?: string;
    cardId?: string;
  }>();

  const { getCardById, updateCard } = useCards();
  const cardId = (paramCardId || routeId) as string;
  // Колода прилетает как deckId
  const id = deckId as string;

  const [cardTitle, setCardTitle] = useState("");

  const [detail, setDetail] = useState<CardDetailResponse | null>(null);
  // карточка из detail — для плиток Сложность/Стабильность
  const card = detail?.card ?? null;
  //состояние отложенности
  const [isPutOff, setIsPutOff] = useState(false);
  // поп-ап предпросмотра (тот же, что в конструкторе)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const { width } = useWindowDimensions();
  // Мобилка: 2 колонки (2×2), широкий экран (≥768px): все 4 в ряд
  const metricColumns = width >= 768 ? 4 : 2;

  const handleBack = () => {
    router.push(`/decks/${id}`);
  };

  const handleEditCard = () => {
    if (cardId && id) {
      // Редактирование — конструктор в режиме edit внутри стека create-card
      router.push(`/decks/${id}/create-card/edit?cardId=${cardId}`);
    } else {
      console.warn(
        "Не удалось определить cardId/deckId для перехода к редактированию",
      );
    }
  };

  const handleViewCard = () => {
    setIsPreviewVisible(true);
  };
  const handleInfoPutOff = () => {};
  const handleInfoMetrics = () => {};
  const handlePutOffCard = async (newValue: boolean) => {
    if (!cardId) return;
    setIsPutOff(newValue);
    try {
      await updateCard(cardId, { is_suspended: newValue });
    } catch {
      //откат свича если сервер не принял
      setIsPutOff(!newValue);
    }
  };

  useEffect(() => {
    if (!cardId) return;
    (async () => {
      // 1) мгновенно из кэша стора (если карточка там есть)
      const cached = await getCardById(cardId);
      if (cached) {
        setCardTitle(cached.title);
        setIsPutOff(cached.is_suspended ?? false);
        // блоки для поп-апа превью — сразу из кэша (глазик работает и офлайн)
        setDetail({
          card: cached,
          last_review_datetime: null,
          next_review_datetime: null,
          review_history: [],
        });
      }
      // 2) свежие данные + ревью-история с сервера
      try {
        const loaded = await fetchCardById(cardId);
        setDetail(loaded);
        setCardTitle(loaded.card.title);
        setIsPutOff(loaded.card.is_suspended ?? false);
      } catch {
        // сеть недоступна — остаёмся на кэше, плитки ревью покажут «—»
      }
    })();
  }, [cardId]);

  // Плитки метрик
  const metrics = [
    {
      icon: IconDifficultyMetrics,
      title: "Сложность",
      value:
        card?.difficulty != null
          ? `${parseFloat(card.difficulty.toFixed(2))} / 10`
          : "—",
    },
    {
      icon: IconChartMetrics,
      title: "Стабильность",
      // не больше двух знаков после запятой, без хвостовых нулей
      value:
        card?.stability != null
          ? `${parseFloat(card.stability.toFixed(2))} дн.`
          : "—",
    },
    {
      icon: IconRepeatsMetrics,
      title: "Дата повтора",
      // «последнее → следующее», как на макете: 25.08 → 08.09
      value: detail?.next_review_datetime
        ? `${detail.last_review_datetime ? `${formatDate(detail.last_review_datetime)} → ` : ""}${formatDate(detail.next_review_datetime)}`
        : "—",
    },
    {
      icon: IconTimeMetrics,
      title: "Время изучения",
      // суммарное время всех ревью: «4 мин 20 сек»
      value:
        detail && detail.review_history.length > 0
          ? formatDuration(
              detail.review_history.reduce(
                (sum, r) => sum + r.review_duration_ms,
                0,
              ),
            )
          : "—",
    },
  ];

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 20,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={Platform.OS === "android"}
        >
          {/* Шапка */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={20}
            >
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Просмотр карточки</Typography>
            <View style={styles.boxActions}>
              <Pressable
                onPress={handleViewCard}

                hitSlop={20}
              >
                <Image
                  source={viewCardIcon}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
              <Pressable
                onPress={handleEditCard}

                hitSlop={20}
              >
                <Image
                  source={editCardIcon}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
            </View>
          </View>
          {/* Название карточки */}
          <View style={[commonStyles.mainBox, styles.nameCard]}>
            <Typography variant="h2">{cardTitle}</Typography>
          </View>
          {/* Кнопка отложено */}
          <View style={[commonStyles.mainBox, styles.boxPutOff]}>
            <View style={styles.boxInfo}>
              <Typography variant="h2">Отложить</Typography>
              <Pressable onPress={handleInfoPutOff}>
                <Image source={infoIcon} style={{ width: 16, height: 16 }} />
              </Pressable>
            </View>
            <CustomSwitch value={isPutOff} onValueChange={handlePutOffCard} />
          </View>
          {/* Текущие метрики */}
          <View style={styles.metricsBox}>
            <View style={styles.boxInfo}>
              <Typography variant="h2">Текущие метрики</Typography>
              <Pressable onPress={handleInfoMetrics}>
                <Image source={infoIcon} style={{ width: 16, height: 16 }} />
              </Pressable>
            </View>
            <View style={styles.metricsGrid}>
              {metrics.map((m) => (
                <View
                  key={m.title}
                  style={[
                    styles.metricCard,
                    { width: metricColumns === 4 ? "23.5%" : "48.5%" },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <View style={styles.metricIconBox}>
                      <Image
                        source={m.icon}
                        style={styles.metricIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Typography variant="span" style={{fontSize: 13, fontWeight: "700"}} color={"#645E88"}>{m.title}</Typography>
                  </View>
                  <Typography variant="h3" color={"#645E88"}>{m.value}</Typography>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      {/* Поп-ап предпросмотра — тот же, что в режиме редактирования */}
      <PreviewModal
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        frontBlocks={card?.front ?? []}
        backBlocks={card?.back ?? []}
        initialSide="front"
      />
    </View>
  );
}
