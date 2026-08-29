import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import IconInfo from "@/feature-decks/deck-study/assets/icon/IconInfo.png";
import IconPlus from "@/feature-decks/deck-study/assets/icon/IconPlus.png";
import IconMinus from "@/feature-decks/deck-study/assets/icon/IconMinus.png";
import SmallIcon from "@/assets/icons/SmallLogo.png";
import { useDecks } from "@/storage/hooks/useDecks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "@/feature-decks/deck-study/styles/StudyDecks.styles";
import { MainButton } from "@/components/MainButton";
import { useEffect, useState } from "react";
import { Animated } from "react-native";
import { colors } from "@/styles/Colors";

export default function StudyDecksScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decks } = useDecks();
  const deck = decks.find((d) => d.id === id);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Начальная прозрачность 0

  const [addCount, setAddCount] = useState(0);

  // v2.0.0: GET /study удалён — счётчики считаем из данных колоды
  const total = deck?.total_cards ?? 0;
  const inLearning = deck?.cards_on_study?.length ?? 0;
  const newCard = Math.max(0, total - inLearning);

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

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%"}}
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
            <View style={styles.header}>
              <Pressable onPress={handleBack}>
                <Image source={ReturnIcon} style={{ width: 12, height: 22 }} />
              </Pressable>
              <Typography
                variant="h1"
                style={styles.headerTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {deck?.name}
              </Typography>
            </View>

            <View style={[commonStyles.mainBox, { gap: 24 }, styles.infoBox]}>
              <View style={styles.infoLine}>
                <Typography variant="h2">Всего карточек</Typography>
                <Typography variant="h2">{total}</Typography>
              </View>
              <View style={styles.infoLine}>
                <Typography variant="h2">Новые</Typography>
                <Typography variant="h2">{newCard}</Typography>
              </View>
              <View style={styles.infoLine}>
                <Typography variant="h2">В обучении</Typography>
                <Typography variant="h2">{inLearning}</Typography>
              </View>
              <View style={[styles.infoLine, { paddingEnd: 0 }]}>
                <View style={styles.infoContent}>
                  <Typography variant="h2">Добавить к изучению</Typography>
                  <View>
                    <Pressable
                      onPress={() => setIsTooltipVisible(!isTooltipVisible)}
                      onHoverIn={() => setIsTooltipVisible(true)}
                      onHoverOut={() => setIsTooltipVisible(false)}
                    >
                      <Image
                        source={IconInfo}
                        style={{ width: 20, height: 20 }}
                      />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.counter}>
                  <Pressable
                    onPress={() => setAddCount((prev) => Math.max(0, prev - 1))}
                  >
                    <Image
                      source={IconMinus}
                      style={{ width: 21, height: 20 }}
                    />
                  </Pressable>
                  <Typography variant="h2">{addCount}</Typography>
                  <Pressable
                    onPress={() =>
                      setAddCount((prev) => Math.min(newCard, prev + 1))
                    }
                  >
                    <Image
                      source={IconPlus}
                      style={{
                        width: 21,
                        height: 20,
                        opacity: addCount >= newCard ? 0.3 : 1,
                      }}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {isTooltipVisible && (
              <Animated.View
                style={[
                  styles.tooltip,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image source={SmallIcon} style={{ width: 20, height: 20 }} />
                <View style={{ flex: 1 }}>
                  <Typography variant="h3">
                    Не рекомендуем добавлять сразу все карточки к изучению,
                    начните с 5-20 в день. Следите, чтобы "К повтору сегодня" не
                    росло слишком сильно, берегите свое здоровье
                  </Typography>
                </View>
              </Animated.View>
            )}
          </View>
        </View>

        <View
          style={{
            gap: 12,
            alignItems: "center",
            width: "100%",
            paddingHorizontal: 10,
            paddingBottom: 16,
          }}
        >
          <Typography variant="h2">
            К повторению сегодня: {(deck?.repeat_cards ?? 0) + addCount}
          </Typography>
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
    </View>
  );
}

