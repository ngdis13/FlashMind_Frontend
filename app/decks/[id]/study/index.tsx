import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import IconInfo from "./assets/icon/IconInfo.png";
import IconPlus from "./assets/icon/IconPlus.png";
import IconMinus from "./assets/icon/IconMinus.png";
import SmallIcon from "@/assets/icons/SmallLogo.png";
import { useDecks } from "@/storage/hooks/useDecks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./style/styles";
import { MainButton } from "@/components/MainButton";
import { useEffect, useState } from "react";
import { getStudyInfo, StudyResponse } from "./api/api";
import { Animated } from "react-native";
import { colors } from "@/styles/Colors";

export default function StudyDecksScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decks } = useDecks();
  const deck = decks.find((d) => d.id === id);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Начальная прозрачность 0

  const [studyData, setStudyData] = useState<StudyResponse | null>(null);
  const [addCount, setAddCount] = useState(0);
  const newCard = studyData
    ? Math.max(0, studyData.total - studyData.learned - studyData.in_learning)
    : 0;

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

  useEffect(() => {
    if (id) {
      getStudyInfo(id as string).then((data) => {
        setStudyData(data);

        // Вычисляем, сколько новых карточек доступно
        const availableNew = data.total - data.learned - data.in_learning;

        // Ставим по умолчанию 5 карточек, но если их всего 3, то поставим 3
        const defaultToLearn = Math.max(0, Math.min(availableNew, 5));

        setAddCount(defaultToLearn);
      });
    }
  }, [id]);

  return (
    // 1. Внешняя фоновая подложка на весь экран ПК
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      {/* 2. Наш адаптивный контейнер шириной 800px, центрированный по горизонтали */}
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        {/* 3. Оборачиваем верхний контент в общий адаптивный блок */}
        <View
          style={[
            commonStyles.content,
            { flex: 1, justifyContent: "flex-start" },
          ]}
        >
          <View
            style={[
              commonStyles.mainContent,
              styles.mainContent,
              { width: "100%" },
            ]}
          >
            <View style={styles.header}>
              <Pressable
                onPress={handleBack}
                style={{ padding: 6, marginLeft: -6 }}
              >
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
                <Typography variant="h2">{studyData?.total}</Typography>
              </View>
              <View style={styles.infoLine}>
                <Typography variant="h2">Новые</Typography>
                <Typography variant="h2">{newCard}</Typography>
              </View>
              <View style={styles.infoLine}>
                <Typography variant="h2">Изучено</Typography>
                <Typography variant="h2">{studyData?.learned}</Typography>
              </View>
              <View style={styles.infoLine}>
                <Typography variant="h2">На изучении</Typography>
                <Typography variant="h2">{studyData?.in_learning}</Typography>
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
                    начните с 5-20 в день...
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
            maxWidth: 800,
          }}
        >
          <Typography variant="h2">
            К повторению сегодня: {(studyData?.learning_today ?? 0) + addCount}
          </Typography>
          <View style={styles.startButton}>
            <MainButton
              style={[styles.startButton, { width: "100%" }]}
              title="Старт"
              onPress={handleStartStudy}
              disabled={!studyData || ((studyData.learning_today ?? 0) + addCount) === 0}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
