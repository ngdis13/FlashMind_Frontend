import React, { useState } from "react";
import { Pressable, ScrollView, View, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { colors } from "@/styles/Colors";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { styles } from "../styles/statisticScreen.styles";
import changeIcon from "@/feature-statistics/assets/ChangeIcon.png";

import IconAverageTime from "@/feature-statistics/assets/IconAverageTime.png";
import IconTotalCards from "@/feature-statistics/assets/IconTotalCards.png";
import IconTotalTime from "@/feature-statistics/assets/IconTotalTime.png";
import IconAverageSuccess from "@/feature-statistics/assets/IconAverageSuccess.png";
import mockData from "../stats-mock-data.json";
import { calcSuccessRate } from "@/utils/helpers/calcSuccessRate";
import { calcAverageSpeed } from "@/utils/helpers/calcAverageSpeed";

import IconInfo from "@/assets/icons/IconInfo.png";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { formatStudyTime } from "@/utils/helpers/formatStudyTime";
import { formatNumber } from "@/utils/helpers/formatNumber";
import { useDecks } from "@/storage/hooks/useDecks";

const SMOOTH_TIMING_CONFIG = {
  duration: 280,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

const SMOOTH_CONFIG = {
  duration: 250,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

export default function StatisticScreen() {
  const { decks } = useDecks();

  const deckOptions = [
    { id: "all", title: "Все колоды" },
    ...decks.map((d) => ({ id: d.id, title: d.name })),
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(deckOptions[0]);

  //Выбранный график в Активности
  const [activeTab, setActiveTab] = useState<"cards" | "time">("cards");

  const metrics = mockData.one_time_metrics;
  const reviewPoints = mockData.review_count.points;
  const timePoints = mockData.review_time.points;

  // Вычисляемые из графиков значения
  const computedSuccessRate = calcSuccessRate(reviewPoints);
  const computedAverageSpeed = calcAverageSpeed(timePoints, reviewPoints);

  // Конфигурация карточек на основе серверных данных
  const STATS_DATA = [
    {
      id: "1",
      icon: IconTotalTime,
      value: formatStudyTime(metrics.total_study_seconds),
      label: "Общее время учебы",
    },
    {
      id: "2",
      icon: IconAverageSuccess,
      value: `${computedSuccessRate}%`,
      label: "Средняя успешность",
    },
    {
      id: "3",
      icon: IconTotalCards,
      value: formatNumber(metrics.total_reviews),
      label: "Просмотрено карточек",
    },
    {
      id: "4",
      icon: IconAverageTime,
      value: computedAverageSpeed,
      label: "Среднее время ответа",
    },
  ];

  //Анимации

  /**Для выпадающего списка */
  const animatedProgress = useSharedValue(0);

  // Анимированные значения для позиции ползунка и его ширины
  const tabProgress = useSharedValue(0);

  const handleTabChange = (tab: "cards" | "time") => {
    setActiveTab(tab);
    tabProgress.value = withTiming(tab === "cards" ? 0 : 1, SMOOTH_CONFIG);
  };

  // Анимированный стиль для ползунка
  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // 88 — это точный шаг сдвига, равный ширине одной кнопки
          translateX: tabProgress.value * 88,
        },
      ],
    };
  });

  const toggleDropdown = () => {
    if (isOpen) {
      animatedProgress.value = withTiming(
        0,
        SMOOTH_TIMING_CONFIG,
        (isFinished) => {
          if (isFinished) runOnJS(setIsOpen)(false);
        },
      );
    } else {
      setIsOpen(true);
      animatedProgress.value = withTiming(1, SMOOTH_TIMING_CONFIG);
    }
  };

  const handleSelectDeck = (deck: (typeof deckOptions)[0]) => {
    setSelectedDeck(deck);
    animatedProgress.value = withTiming(
      0,
      SMOOTH_TIMING_CONFIG,
      (isFinished) => {
        if (isFinished) runOnJS(setIsOpen)(false);
      },
    );
  };

  const arrowStyle = useAnimatedStyle(() => {
    return { transform: [{ rotate: `${animatedProgress.value * 180}deg` }] };
  });

  const dropdownStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedProgress.value,
      transform: [{ translateY: (animatedProgress.value - 1) * 12 }],
    };
  });

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={{ width: "100%" }}
          scrollEventThrottle={16}
        >
          <View style={styles.responsiveWrapper}>
            <Typography
              variant="h1"
              style={{ marginBottom: 16, width: "100%" }}
            >
              Статистика
            </Typography>
          </View>

          {/* Селектор колод */}
          <View style={[styles.changeDeckList, { zIndex: 10 }]}>
            <View style={styles.dropdownContainer}>
              <Pressable style={styles.changeDeckBox} onPress={toggleDropdown}>
                <Typography variant="h2" color={colors.mainColor}>
                  {selectedDeck.title}
                </Typography>
              </Pressable>

              {isOpen && (
                <>
                  {/* Невидимая подложка: ловит клики "мимо" экрана и закрывает список, 
              не мешая при этом скроллить элементы внутри самого списка */}
                  <Pressable
                    style={{
                      position: "absolute",
                      top: -500, // Перекрывает экран далеко вверх
                      left: -50,
                      right: -50,
                      bottom: -2000, // Перекрывает экран далеко вниз до самого конца
                      zIndex: 1,
                    }}
                    onPress={toggleDropdown}
                  />

                  <Animated.View
                    style={[styles.dropdownList, dropdownStyle, { zIndex: 2 }]}
                  >
                    <ScrollView
                      style={{ maxHeight: 240 }}
                      nestedScrollEnabled={true}
                    >
                      {deckOptions.map((deck) => {
                        const isSelected = deck.id === selectedDeck.id;
                        return (
                          <Pressable
                            key={deck.id}
                            style={[
                              styles.dropdownItem,
                              isSelected
                                ? styles.dropdownItemActive
                                : styles.dropdownItemInactive,
                            ]}
                            onPress={() => handleSelectDeck(deck)}
                          >
                            <Typography
                              variant="h2"
                              color={
                                isSelected ? colors.white : colors.mainColor
                              }
                            >
                              {deck.title}
                            </Typography>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </Animated.View>
                </>
              )}
            </View>

            <Pressable style={styles.changeButton} onPress={toggleDropdown}>
              <Animated.Image
                source={changeIcon}
                style={[styles.imageChangeButton, arrowStyle]}
              />
            </Pressable>
          </View>

          {/* Верхние общие плашки статистики*/}
          <View style={styles.statsGrid}>
            {STATS_DATA.map((item) => (
              <View key={item.id} style={styles.statCardContainer}>
                {/* 1. Задний фон: Градиент с точным направлением из Figma (снизу-лево в сверху-право) */}
                <LinearGradient
                  colors={[
                    "rgba(110, 117, 217, 0.5)",
                    "rgba(219, 221, 252, 0.4)",
                  ]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.absoluteGradient}
                />

                {/* 2. Передний слой: Матовое стекло (Glassmorphism) с размытием заднего плана */}
                <BlurView
                  intensity={20}
                  tint="light"
                  style={styles.statCardBlur}
                >
                  {/* Блок иконки */}
                  <View style={styles.cardIconWrapper}>
                    <Image source={item.icon} style={styles.cardIcon} />
                  </View>

                  {/* Блок текстов (Значение и Подпись) */}
                  <View>
                    <Typography
                      variant="h1"
                      color={colors.mainNumber}
                      style={styles.cardValue}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      variant="h3"
                      color={colors.labelNumber}
                      style={styles.cardLabel}
                    >
                      {item.label}
                    </Typography>
                  </View>
                </BlurView>
              </View>
            ))}
          </View>
          <View style={[commonStyles.mainBox, styles.activityGraph]}>
            <View style={styles.activityGraph_header}>
              <View style={styles.activityGraph_headerName}>
                <Typography variant="h2">Активность</Typography>
                <Image source={IconInfo} style={styles.infoIcon} />
              </View>

              <View style={styles.activityGraph_toggleContainer}>
                {/* Анимированный ползунок подложки */}
                <Animated.View style={[styles.toggleSlider, sliderStyle]} />

                <Pressable
                  style={styles.toggleButton}
                  onPress={() => handleTabChange("cards")}
                >
                  <Typography
                    variant="h3"
                    color={
                      activeTab === "cards" ? colors.white : colors.darkMainColor
                    }
                  >
                    Карточки
                  </Typography>
                </Pressable>

                <Pressable
                  style={styles.toggleButton}
                  onPress={() => handleTabChange("time")}
                >
                  <Typography
                    variant="h3"
                    color={
                      activeTab === "time" ? colors.white : colors.darkMainColor
                    }
                  >
                    Время
                  </Typography>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
