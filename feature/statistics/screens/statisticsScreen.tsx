import React, { useState, useEffect, useRef } from "react";
import {
  Pressable,
  ScrollView,
  View,
  Image,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import Svg, { Polyline, Circle } from "react-native-svg";
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

const HoverableCircle = Circle as unknown as React.ComponentType<
  React.ComponentProps<typeof Circle> & {
    onMouseEnter?: (e: any) => void;
    onMouseLeave?: () => void;
  }
>;

const SMOOTH_TIMING_CONFIG = {
  duration: 280,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

const SMOOTH_CONFIG = {
  duration: 250,
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

  //Выбранный график в Активности
  const [activeTab, setActiveTab] = useState<"cards" | "time">("cards");
  const [selectedBar, setSelectedBar] = useState<ReviewPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scrollOffsetX, setScrollOffsetX] = useState(0);

  // Для линейного графика времени
  const [chartWidth, setChartWidth] = useState(0);
  const [selectedTimePoint, setSelectedTimePoint] = useState<{
    point: { date: string; seconds: number };
    x: number;
    y: number;
  } | null>(null);

  // 1. Вычисляем суммарное максимальное значение среди всех дней для правильного масштабирования высоты (Y)
  const maxTotalValue = Math.max(
    Math.ceil(
      Math.max(
        ...mockData.review_count.points.map(
          (d) => d.forgotten + d.hard + d.good + d.easy,
        ),
      ) * 1.15,
    ),
    20, // Предохранитель на случай нулевых данных
  );
  const chartHeight = 200; // Фиксированная высота рабочей области графика

  const handleBarPress = (
    item: ReviewPoint,
    index: number,
    event: GestureResponderEvent,
  ) => {
    const barWidthWithGap = 44; // Ширина колонки (24) + gap (20)
    const total = item.forgotten + item.hard + item.good + item.easy;
    const barPixelHeight = (total / maxTotalValue) * chartHeight;
    const tooltipHeightWithGap = 90; // Высота тултипа + минимальный зазор

    setTooltipPos({
      x: index * barWidthWithGap - 26,
      y: chartHeight - barPixelHeight - tooltipHeightWithGap, // Над столбиком с зазором 10px
    });

    // Если кликнули на ту же колонку — закрываем тултип
    if (selectedBar?.date === item.date) {
      setSelectedBar(null);
    } else {
      setSelectedBar(item);
    }
  };

  // Обработчик клика по точке линейного графика (время)
  const handleTimePointPress = (
    point: { date: string; seconds: number },
    x: number,
    y: number,
  ) => {
    if (selectedTimePoint?.point.date === point.date) {
      setSelectedTimePoint(null);
    } else {
      setSelectedTimePoint({ point, x, y });
    }
  };

  // Авто-скрытие тултипа через 3 секунды
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (selectedBar) {
      tooltipTimer.current = setTimeout(() => setSelectedBar(null), 3000);
    }
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, [selectedBar]);

  const metrics = mockData.one_time_metrics;
  const reviewPoints = mockData.review_count.points;
  const timePoints = mockData.review_time.points;

  // Данные для линейного графика (время) — отсортированы хронологически
  const TIME_DATA = [...timePoints].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const maxSeconds = Math.max(...TIME_DATA.map((p) => p.seconds), 60);
  const maxMinutes = Math.ceil(((maxSeconds / 60) * 1.15) / 4) * 4;
  const totalSeconds = TIME_DATA.reduce((sum, p) => sum + p.seconds, 0);
  const totalHoursLabel = `${Math.floor(totalSeconds / 3600)} ч ${Math.floor((totalSeconds % 3600) / 60)} мин`;

  // Вычисляемые из графиков значения
  const computedSuccessRate = calcSuccessRate(reviewPoints);
  const computedAverageSpeed = calcAverageSpeed(timePoints, reviewPoints);

  // Успешность за сегодняшний день
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPoint = reviewPoints.find((p) => p.date === todayStr);
  const todaySuccessRate = todayPoint ? calcSuccessRate([todayPoint]) : null;
  const successDiff =
    todaySuccessRate !== null ? todaySuccessRate - computedSuccessRate : 0;

  // Общее среднее время на карточку в секундах (для сравнения в тултипе времени)
  const computedAverageSeconds = (() => {
    const totalAllSeconds = timePoints.reduce((s, p) => s + p.seconds, 0);
    const totalAllCards = reviewPoints.reduce(
      (s, r) => s + r.forgotten + r.hard + r.good + r.easy,
      0,
    );
    return totalAllCards > 0 ? Math.round(totalAllSeconds / totalAllCards) : 0;
  })();

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
                      activeTab === "cards"
                        ? colors.white
                        : colors.darkMainColor
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

            {activeTab === "cards" && (
              <View style={styles.chartOuterContainer}>
                {/* Левая ось Y со шкалой из 5 значений */}
                <View style={styles.yAxis}>
                  <Typography variant="h2" style={styles.axisText}>
                    {maxTotalValue}
                  </Typography>
                  <Typography variant="h2" style={styles.axisText}>
                    {Math.round(maxTotalValue * 0.75)}
                  </Typography>
                  <Typography variant="h2" style={styles.axisText}>
                    {Math.round(maxTotalValue / 2)}
                  </Typography>
                  <Typography variant="h2" style={styles.axisText}>
                    {Math.round(maxTotalValue * 0.25)}
                  </Typography>
                  <Typography variant="h2" style={styles.axisText}>
                    0
                  </Typography>
                </View>

                {/* Горизонтальный скролл для колонок */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chartScrollContent}
                  onScrollBeginDrag={() => setSelectedBar(null)}
                  onScroll={(e) =>
                    setScrollOffsetX(e.nativeEvent.contentOffset.x)
                  }
                  scrollEventThrottle={16}
                >
                  <View
                    style={[styles.chartBarsContainer, { height: chartHeight }]}
                  >
                    {/* Сетка из 5 горизонтальных линий (4 равных интервала) */}
                    <View style={StyleSheet.absoluteFill}>
                      <View style={[styles.gridLine, { top: 0 }]} />
                      <View style={[styles.gridLine, { top: "25%" }]} />
                      <View style={[styles.gridLine, { top: "50%" }]} />
                      <View style={[styles.gridLine, { top: "75%" }]} />
                      <View
                        style={[
                          styles.gridLine,
                          {
                            bottom: 0,
                            borderBottomWidth: 2,
                            borderColor: "#E5E5E5",
                          },
                        ]}
                      />
                    </View>

                    {/* Рендер колонок */}
                    {[...mockData.review_count.points]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      )
                      .map((item, index) => {
                        const total =
                          item.forgotten + item.hard + item.good + item.easy;

                        // Расчет высоты каждого сегмента в пикселях на основе пропорции
                        const forgottenHeight =
                          (item.forgotten / maxTotalValue) * chartHeight;
                        const hardHeight =
                          (item.hard / maxTotalValue) * chartHeight;
                        const goodHeight =
                          (item.good / maxTotalValue) * chartHeight;
                        const easyHeight =
                          (item.easy / maxTotalValue) * chartHeight;

                        return (
                          <View key={item.date} style={styles.barColumnWrapper}>
                            {/* Сама интерактивная составная колонка */}
                            <Pressable
                              style={[
                                styles.barColumn,
                                {
                                  height: (total / maxTotalValue) * chartHeight,
                                },
                              ]}
                              onPress={(e) => handleBarPress(item, index, e)}
                            >
                              <View
                                style={[
                                  styles.barSegment,
                                  {
                                    height: forgottenHeight,
                                    backgroundColor: colors.ratingRed,
                                  },
                                ]}
                              />
                              <View
                                style={[
                                  styles.barSegment,
                                  {
                                    height: hardHeight,
                                    backgroundColor: colors.ratingYellow,
                                  },
                                ]}
                              />
                              <View
                                style={[
                                  styles.barSegment,
                                  {
                                    height: goodHeight,
                                    backgroundColor: colors.ratingLightGreen,
                                  },
                                ]}
                              />
                              <View
                                style={[
                                  styles.barSegment,
                                  {
                                    height: easyHeight,
                                    backgroundColor: colors.ratingDarkGreen,
                                  },
                                ]}
                              />
                            </Pressable>

                            {/* Подпись даты внизу под углом или вертикально */}
                            <View style={styles.xLabelWrapper}>
                              <Typography
                                variant="h3"
                                style={styles.xLabelText}
                              >
                                {formatDateLabel(item.date)}
                              </Typography>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                </ScrollView>

                {/* ИНТЕРАКТИВНЫЙ ТУЛТИП (ПОДСКАЗКА) — вынесен из ScrollView, чтобы не обрезался */}
                {selectedBar &&
                  (() => {
                    const totalForSelected =
                      selectedBar.forgotten +
                      selectedBar.hard +
                      selectedBar.good +
                      selectedBar.easy;
                    const successRate =
                      totalForSelected > 0
                        ? Math.round(
                            ((selectedBar.good + selectedBar.easy) /
                              totalForSelected) *
                              100,
                          )
                        : 0;

                    return (
                      <View
                        style={[
                          styles.tooltipContainer,
                          {
                            left: tooltipPos.x - scrollOffsetX,
                            top: tooltipPos.y,
                          },
                        ]}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h3" style={styles.tooltipDate}>
                            {formatDateLabel(selectedBar.date)}
                          </Typography>
                          <Typography variant="h3" style={styles.tooltipTotal}>
                            {totalForSelected} карт
                          </Typography>
                        </View>

                        {/* Строка успешности с разницей */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            marginVertical: 4,
                          }}
                        >
                          <Typography
                            variant="h3"
                            style={styles.tooltipSuccessText}
                          >
                            Успешность: {successRate}%
                          </Typography>
                          <Typography
                            variant="h3"
                            style={[
                              styles.tooltipSuccessText,
                              {
                                color:
                                  successRate - computedSuccessRate >= 0
                                    ? colors.ratingDarkGreen
                                    : colors.ratingRed,
                              },
                            ]}
                          >
                            {" "}
                            ({successRate - computedSuccessRate > 0 ? "+" : ""}
                            {successRate - computedSuccessRate}%)
                          </Typography>
                        </View>

                        <View style={styles.tooltipMetricsRow}>
                          <View style={styles.metricDotBox}>
                            <View
                              style={[
                                styles.dot,
                                { backgroundColor: colors.ratingRed },
                              ]}
                            />
                            <Typography style={styles.dotText}>
                              {selectedBar.forgotten}
                            </Typography>
                          </View>
                          <View style={styles.metricDotBox}>
                            <View
                              style={[
                                styles.dot,
                                { backgroundColor: colors.ratingYellow },
                              ]}
                            />
                            <Typography style={styles.dotText}>
                              {selectedBar.hard}
                            </Typography>
                          </View>
                          <View style={styles.metricDotBox}>
                            <View
                              style={[
                                styles.dot,
                                { backgroundColor: colors.ratingLightGreen },
                              ]}
                            />
                            <Typography style={styles.dotText}>
                              {selectedBar.good}
                            </Typography>
                          </View>
                          <View style={styles.metricDotBox}>
                            <View
                              style={[
                                styles.dot,
                                { backgroundColor: colors.ratingDarkGreen },
                              ]}
                            />
                            <Typography style={styles.dotText}>
                              {selectedBar.easy}
                            </Typography>
                          </View>
                        </View>
                        {/* Стрелочка тултипа снизу */}
                        <View style={styles.tooltipArrow} />
                      </View>
                    );
                  })()}
              </View>
            )}

            {/* Линейный график времени */}
            {activeTab === "time" && (
              <View style={styles.chartOuterContainer}>
                <View style={styles.yAxis}>
                  <Typography
                    variant="h2"
                    style={[styles.axisText, { textAlign: "center" }]}
                  >
                    {maxMinutes}
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[styles.axisText, { textAlign: "center" }]}
                  >
                    {Math.round(maxMinutes * 0.75)}
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[styles.axisText, { textAlign: "center" }]}
                  >
                    {Math.round(maxMinutes / 2)}
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[styles.axisText, { textAlign: "center" }]}
                  >
                    {Math.round(maxMinutes * 0.25)}
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[styles.axisText, { textAlign: "center" }]}
                  >
                    0
                  </Typography>
                </View>
                <View
                  style={styles.chartLinesWrapper}
                  onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                >
                  <View style={StyleSheet.absoluteFill}>
                    <View style={[styles.gridLine, { top: 0 }]} />
                    <View style={[styles.gridLine, { top: "25%" }]} />
                    <View style={[styles.gridLine, { top: "50%" }]} />
                    <View style={[styles.gridLine, { top: "75%" }]} />
                    <View
                      style={[
                        styles.gridLine,
                        {
                          bottom: 0,
                          borderBottomWidth: 2,
                          borderColor: "#E5E5E5",
                        },
                      ]}
                    />
                  </View>
                  {chartWidth > 0 && (
                    <View
                      style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
                      pointerEvents="box-none"
                    >
                      <Svg width={chartWidth} height={chartHeight}>
                        {(() => {
                          const paddingX = 4;
                          const drawWidth = chartWidth - paddingX * 2;
                          const getX = (i: number) =>
                            TIME_DATA.length > 1
                              ? paddingX +
                                (i / (TIME_DATA.length - 1)) * drawWidth
                              : chartWidth / 2;
                          const getY = (seconds: number) => {
                            const minutes = seconds / 60;
                            return (
                              chartHeight - (minutes / maxMinutes) * chartHeight
                            );
                          };
                          return (
                            <>
                              <Polyline
                                points={TIME_DATA.map(
                                  (p, i) => `${getX(i)},${getY(p.seconds)}`,
                                ).join(" ")}
                                fill="none"
                                stroke={colors.colorTimeStatisticGraph}
                                strokeWidth={2}
                              />
                              {TIME_DATA.map((p, i) => (
                                <React.Fragment key={p.date}>
                                  <Circle
                                    cx={getX(i)}
                                    cy={getY(p.seconds)}
                                    r={4}
                                    fill={colors.colorTimeStatisticGraph}
                                  />
                                  <HoverableCircle
                                    cx={getX(i)}
                                    cy={getY(p.seconds)}
                                    r={12}
                                    fill="transparent"
                                    onPress={() =>
                                      handleTimePointPress(
                                        p,
                                        getX(i),
                                        getY(p.seconds),
                                      )
                                    }
                                    onMouseEnter={() =>
                                      handleTimePointPress(
                                        p,
                                        getX(i),
                                        getY(p.seconds),
                                      )
                                    }
                                  />
                                </React.Fragment>
                              ))}
                            </>
                          );
                        })()}
                      </Svg>
                    </View>
                  )}
                  {selectedTimePoint &&
                    (() => {
                      const dayReview = reviewPoints.find(
                        (r) => r.date === selectedTimePoint.point.date,
                      );
                      const dayCards = dayReview
                        ? dayReview.forgotten +
                          dayReview.hard +
                          dayReview.good +
                          dayReview.easy
                        : 0;
                      const dayAvgSec =
                        dayCards > 0
                          ? Math.round(
                              selectedTimePoint.point.seconds / dayCards,
                            )
                          : 0;
                      const avgDiff =
                        dayCards > 0 ? dayAvgSec - computedAverageSeconds : 0;

                      return (
                        <View
                          style={[
                            styles.tooltipContainer,
                            {
                              width: 130,
                              left: selectedTimePoint.x - 65,
                              top: selectedTimePoint.y - 60,
                            },
                          ]}
                        >
                          {/* Строка 1: Дата + среднее время с разницей */}
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 4
                            }}
                          >
                            <Typography
                              variant="h3"
                              style={[styles.tooltipDate]}
                            >
                              {formatDateLabel(selectedTimePoint.point.date)}
                            </Typography>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Typography
                                variant="h3"
                                style={styles.tooltipDate}
                              >
                                {dayAvgSec} с
                              </Typography>
                              {avgDiff !== 0 && (
                                <Typography
                                  variant="h3"
                                  style={[
                                    styles.tooltipDate,
                                    {
                                      color:
                                        avgDiff < 0
                                          ? colors.ratingDarkGreen
                                          : colors.ratingRed,
                                    },
                                  ]}
                                >
                                  {" "}
                                  ({avgDiff > 0 ? "+" : ""}
                                  {avgDiff})
                                </Typography>
                              )}
                            </View>
                          </View>
                          {/* Строка 2: Общее время за день */}
                          <Typography
                            variant="h3"
                            style={[
                              styles.tooltipTotal,
                              { textAlign: "center" },
                            ]}
                          >
                            {Math.floor(selectedTimePoint.point.seconds / 60)}{" "}
                            мин {selectedTimePoint.point.seconds % 60} сек
                          </Typography>
                          <View style={[styles.tooltipArrow, { left: 59 }]} />
                        </View>
                      );
                    })()}
                </View>
              </View>
            )}

            {activeTab === "time" && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h3"
                  style={[styles.totalText, { fontWeight: "bold" }]}
                >
                  Всего:{" "}
                </Typography>
                <Typography variant="h3" style={styles.totalText}>
                  {totalHoursLabel}
                </Typography>
              </View>
            )}

            {/* Легенда категорий */}
            {activeTab === "cards" && (
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.ratingRed },
                    ]}
                  />
                  <Typography variant="h3">Забыл</Typography>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.ratingYellow },
                    ]}
                  />
                  <Typography variant="h3">Сложно</Typography>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.ratingLightGreen },
                    ]}
                  />
                  <Typography variant="h3">Хорошо</Typography>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.ratingDarkGreen },
                    ]}
                  />
                  <Typography variant="h3">Легко</Typography>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
