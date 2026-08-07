import React, { useState, useEffect, useRef } from "react";
import {
  Pressable,
  ScrollView,
  View,
  Image,
  StyleSheet,
} from "react-native";
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

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { formatStudyTime } from "@/utils/helpers/formatStudyTime";
import { formatNumber } from "@/utils/helpers/formatNumber";
import { useDecks } from "@/storage/hooks/useDecks";
import ActivityGraph from "@/feature-statistics/components/ActivityGraph";

const SMOOTH_TIMING_CONFIG = {
  duration: 280,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

// Форматирование дат: «Сегодня», «Вчера» или «5 Августа»
const formatDateLabel = (dateStr: string) => {
  const checkDate = new Date(dateStr);

  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  const [, , day] = dateStr.split("-");
  return `${parseInt(day)} ${months[checkDate.getMonth()]}`;
};

type ReviewPoint = {
  date: string;
  forgotten: number;
  hard: number;
  good: number;
  easy: number;
};

export default function StatisticScreen() {
  const { decks } = useDecks();

  const deckOptions = [
    { id: "all", title: "Все колоды" },
    ...decks.map((d) => ({ id: d.id, title: d.name })),
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(deckOptions[0]);

  const metrics = mockData.one_time_metrics;
  const reviewPoints = mockData.review_count.points;
  const timePoints = mockData.review_time.points;

  // Вычисляемые из графиков значения (для верхних плашек)
  const computedSuccessRate = calcSuccessRate(reviewPoints);
  const computedAverageSpeed = calcAverageSpeed(timePoints, reviewPoints);

  // Успешность за сегодняшний день
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPoint = reviewPoints.find((p) => p.date === todayStr);
  const todaySuccessRate = todayPoint ? calcSuccessRate([todayPoint]) : null;
  const successDiff =
    todaySuccessRate !== null ? todaySuccessRate - computedSuccessRate : 0;

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
          <ActivityGraph reviewPoints={reviewPoints} timePoints={timePoints} />
        </ScrollView>
      </View>
    </View>
  );
}
