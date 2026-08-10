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
} from "react-native-reanimated";
import { colors } from "@/styles/Colors";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { activityGraphStyles as styles } from "./styles";
import { calcSuccessRate } from "@/utils/helpers/calcSuccessRate";

import IconInfo from "@/assets/icons/IconInfo.png";
import { InfoActivityCards } from "./components/InfoActivityCards";
import { InfoActivityTime } from "./components/InfoActivityTime";

// ==================== Типы ====================
type ReviewPoint = {
  date: string;
  forgotten: number;
  hard: number;
  good: number;
  easy: number;
};

type TimePoint = {
  date: string;
  seconds: number;
};

// ==================== Константы ====================
const SMOOTH_CONFIG = {
  duration: 250,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

const HoverableCircle = Circle as unknown as React.ComponentType<
  React.ComponentProps<typeof Circle> & {
    onMouseEnter?: (e: any) => void;
    onMouseLeave?: () => void;
  }
>;

// ==================== Утилиты ====================
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

// ==================== Пропсы ====================
interface ActivityGraphProps {
  reviewPoints: ReviewPoint[];
  timePoints: TimePoint[];
}

// ==================== Компонент ====================
export default function ActivityGraph({
  reviewPoints,
  timePoints,
}: ActivityGraphProps) {
  // ========== Стейты ==========
  const [activeTab, setActiveTab] = useState<"cards" | "time">("cards");
  const [selectedBar, setSelectedBar] = useState<ReviewPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const [chartWidth, setChartWidth] = useState(0);
  const [selectedTimePoint, setSelectedTimePoint] = useState<{
    point: { date: string; seconds: number };
    x: number;
    y: number;
  } | null>(null);

  // ========== Вычисления для столбчатого графика ==========
  const maxTotalValue = Math.max(
    Math.ceil(
      Math.max(
        ...reviewPoints.map((d) => d.forgotten + d.hard + d.good + d.easy),
      ) * 1.15,
    ),
    20,
  );
  const chartHeight = 200;

  const handleBarPress = (
    item: ReviewPoint,
    index: number,
    _event: GestureResponderEvent,
  ) => {
    const barWidthWithGap = 44;
    const total = item.forgotten + item.hard + item.good + item.easy;
    const barPixelHeight = (total / maxTotalValue) * chartHeight;
    const tooltipHeightWithGap = 90;

    setTooltipPos({
      x: index * barWidthWithGap - 26,
      y: chartHeight - barPixelHeight - tooltipHeightWithGap,
    });

    if (selectedBar?.date === item.date) {
      setSelectedBar(null);
    } else {
      setSelectedBar(item);
    }
  };

  // ========== Вычисления для линейного графика ==========
  const TIME_DATA = [...timePoints].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const maxSeconds = Math.max(...TIME_DATA.map((p) => p.seconds), 60);
  const maxMinutes = Math.ceil(((maxSeconds / 60) * 1.15) / 4) * 4;
  const totalSeconds = TIME_DATA.reduce((sum, p) => sum + p.seconds, 0);
  const totalHoursLabel = `${Math.floor(totalSeconds / 3600)} ч ${Math.floor((totalSeconds % 3600) / 60)} мин`;

  /** Ширина линейного графика: по 44px на точку, минимум как экран */
  const POINT_SPACING = 44;
  const timeChartWidth = Math.max(chartWidth, TIME_DATA.length * POINT_SPACING);

  const computedSuccessRate = calcSuccessRate(reviewPoints);

  // Общее среднее время на карточку в секундах
  const computedAverageSeconds = (() => {
    const totalAllSeconds = timePoints.reduce((s, p) => s + p.seconds, 0);
    const totalAllCards = reviewPoints.reduce(
      (s, r) => s + r.forgotten + r.hard + r.good + r.easy,
      0,
    );
    return totalAllCards > 0 ? Math.round(totalAllSeconds / totalAllCards) : 0;
  })();

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

  // ========== Авто-скрытие тултипа столбиков ==========
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (selectedBar) {
      tooltipTimer.current = setTimeout(() => setSelectedBar(null), 3000);
    }
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, [selectedBar]);

  // ========== Анимация переключателя ==========
  const tabProgress = useSharedValue(0);

  const handleTabChange = (tab: "cards" | "time") => {
    setActiveTab(tab);
    tabProgress.value = withTiming(tab === "cards" ? 0 : 1, SMOOTH_CONFIG);
  };

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabProgress.value * 88 }],
  }));

  // ========== Рендер ==========
  const handleInfo = () => {
    setIsInfoVisible(true);
  };

  return (
    <View style={[commonStyles.mainBox, styles.activityGraph]}>
      {/* Заголовок с переключателем */}
      <View style={styles.activityGraph__header}>
        <View style={styles.activityGraph__headerName}>
          <Typography variant="h2">Активность</Typography>
          <Pressable onPress={handleInfo}>
            <Image source={IconInfo} style={styles.activityGraph__infoIcon} />
          </Pressable>
        </View>

        <View style={styles.toggle}>
          <Animated.View style={[styles.toggle__slider, sliderStyle]} />
          <Pressable
            style={styles.toggle__button}
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
            style={styles.toggle__button}
            onPress={() => handleTabChange("time")}
          >
            <Typography
              variant="h3"
              color={activeTab === "time" ? colors.white : colors.darkMainColor}
            >
              Время
            </Typography>
          </Pressable>
        </View>
      </View>

      {/* ==================== СТОЛБЧАТЫЙ ГРАФИК ==================== */}
      {activeTab === "cards" && (
        <View style={styles.chart}>
          <View style={styles.chart__yAxis}>
            <Typography variant="h2" style={styles.chart__axisText}>
              {maxTotalValue}
            </Typography>
            <Typography variant="h2" style={styles.chart__axisText}>
              {Math.round(maxTotalValue * 0.75)}
            </Typography>
            <Typography variant="h2" style={styles.chart__axisText}>
              {Math.round(maxTotalValue / 2)}
            </Typography>
            <Typography variant="h2" style={styles.chart__axisText}>
              {Math.round(maxTotalValue * 0.25)}
            </Typography>
            <Typography variant="h2" style={styles.chart__axisText}>
              0
            </Typography>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chart__scrollContent}
            onScrollBeginDrag={() => setSelectedBar(null)}
            onScroll={(e) => setScrollOffsetX(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            <View style={[styles.chart__bars, { height: chartHeight }]}>
              <View style={StyleSheet.absoluteFill}>
                <View style={[styles.chart__gridLine, { top: 0 }]} />
                <View style={[styles.chart__gridLine, { top: "25%" }]} />
                <View style={[styles.chart__gridLine, { top: "50%" }]} />
                <View style={[styles.chart__gridLine, { top: "75%" }]} />
                <View
                  style={[
                    styles.chart__gridLine,
                    { bottom: 0, borderBottomWidth: 2, borderColor: "#E5E5E5" },
                  ]}
                />
              </View>

              {[...reviewPoints]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((item, index) => {
                  const total =
                    item.forgotten + item.hard + item.good + item.easy;
                  const forgottenHeight =
                    (item.forgotten / maxTotalValue) * chartHeight;
                  const hardHeight = (item.hard / maxTotalValue) * chartHeight;
                  const goodHeight = (item.good / maxTotalValue) * chartHeight;
                  const easyHeight = (item.easy / maxTotalValue) * chartHeight;

                  return (
                    <View key={item.date} style={styles.chart__barWrapper}>
                      <Pressable
                        style={[
                          styles.chart__bar,
                          { height: (total / maxTotalValue) * chartHeight },
                        ]}
                        onPress={(e) => handleBarPress(item, index, e)}
                      >
                        <View
                          style={[
                            styles.chart__barSegment,
                            {
                              height: forgottenHeight,
                              backgroundColor: colors.ratingRed,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.chart__barSegment,
                            {
                              height: hardHeight,
                              backgroundColor: colors.ratingYellow,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.chart__barSegment,
                            {
                              height: goodHeight,
                              backgroundColor: colors.ratingLightGreen,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.chart__barSegment,
                            {
                              height: easyHeight,
                              backgroundColor: colors.ratingDarkGreen,
                            },
                          ]}
                        />
                      </Pressable>
                      <View style={styles.chart__xLabel}>
                        <Typography
                          variant="h3"
                          style={styles.chart__xLabelText}
                        >
                          {formatDateLabel(item.date)}
                        </Typography>
                      </View>
                    </View>
                  );
                })}
            </View>
          </ScrollView>

          {/* Тултип столбчатого графика */}
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
                    styles.tooltip,
                    { left: tooltipPos.x - scrollOffsetX, top: tooltipPos.y },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h3" style={styles.tooltip__date}>
                      {formatDateLabel(selectedBar.date)}
                    </Typography>
                    <Typography variant="h3" style={styles.tooltip__total}>
                      {totalForSelected} карт
                    </Typography>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      marginVertical: 4,
                    }}
                  >
                    <Typography variant="h3" style={styles.tooltip__success}>
                      Успешность: {successRate}%
                    </Typography>
                    <Typography
                      variant="h3"
                      style={[
                        styles.tooltip__success,
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
                  <View style={styles.tooltip__metrics}>
                    <View style={styles.tooltip__metricDot}>
                      <View
                        style={[
                          styles.tooltip__dot,
                          { backgroundColor: colors.ratingRed },
                        ]}
                      />
                      <Typography style={styles.tooltip__dotText}>
                        {selectedBar.forgotten}
                      </Typography>
                    </View>
                    <View style={styles.tooltip__metricDot}>
                      <View
                        style={[
                          styles.tooltip__dot,
                          { backgroundColor: colors.ratingYellow },
                        ]}
                      />
                      <Typography style={styles.tooltip__dotText}>
                        {selectedBar.hard}
                      </Typography>
                    </View>
                    <View style={styles.tooltip__metricDot}>
                      <View
                        style={[
                          styles.tooltip__dot,
                          { backgroundColor: colors.ratingLightGreen },
                        ]}
                      />
                      <Typography style={styles.tooltip__dotText}>
                        {selectedBar.good}
                      </Typography>
                    </View>
                    <View style={styles.tooltip__metricDot}>
                      <View
                        style={[
                          styles.tooltip__dot,
                          { backgroundColor: colors.ratingDarkGreen },
                        ]}
                      />
                      <Typography style={styles.tooltip__dotText}>
                        {selectedBar.easy}
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.tooltip__arrow} />
                </View>
              );
            })()}
        </View>
      )}

      {/* ==================== ЛИНЕЙНЫЙ ГРАФИК ==================== */}
      {activeTab === "time" && (
        <View style={styles.chart}>
          <View style={styles.chart__yAxis}>
            <Typography
              variant="h2"
              style={[styles.chart__axisText, { textAlign: "center" }]}
            >
              {maxMinutes}
            </Typography>
            <Typography
              variant="h2"
              style={[styles.chart__axisText, { textAlign: "center" }]}
            >
              {Math.round(maxMinutes * 0.75)}
            </Typography>
            <Typography
              variant="h2"
              style={[styles.chart__axisText, { textAlign: "center" }]}
            >
              {Math.round(maxMinutes / 2)}
            </Typography>
            <Typography
              variant="h2"
              style={[styles.chart__axisText, { textAlign: "center" }]}
            >
              {Math.round(maxMinutes * 0.25)}
            </Typography>
            <Typography
              variant="h2"
              style={[styles.chart__axisText, { textAlign: "center" }]}
            >
              0
            </Typography>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chart__scrollContent}
            onScrollBeginDrag={() => setSelectedTimePoint(null)}
            scrollEventThrottle={16}
          >
            <View style={{ width: timeChartWidth, height: chartHeight, position: "relative" }}>
              {/* Сетка */}
              <View style={StyleSheet.absoluteFill}>
                <View style={[styles.chart__gridLine, { top: 0 }]} />
                <View style={[styles.chart__gridLine, { top: "25%" }]} />
                <View style={[styles.chart__gridLine, { top: "50%" }]} />
                <View style={[styles.chart__gridLine, { top: "75%" }]} />
                <View
                  style={[
                    styles.chart__gridLine,
                    { bottom: 0, borderBottomWidth: 2, borderColor: "#E5E5E5" },
                  ]}
                />
              </View>

              {/* SVG с линией и точками */}
              <View
                style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
                pointerEvents="box-none"
              >
                <Svg width={timeChartWidth} height={chartHeight}>
                  {(() => {
                    const paddingX = 20;
                    const drawWidth = timeChartWidth - paddingX * 2;
                    const getX = (i: number) =>
                      TIME_DATA.length > 1
                        ? paddingX + (i / (TIME_DATA.length - 1)) * drawWidth
                        : timeChartWidth / 2;
                    const getY = (seconds: number) => {
                      const minutes = seconds / 60;
                      return chartHeight - (minutes / maxMinutes) * chartHeight;
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
                              r={16}
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

              {/* Подписи дат (ось X) */}
              {TIME_DATA.map((p, i) => {
                const paddingX = 20;
                const drawWidth = timeChartWidth - paddingX * 2;
                const x =
                  TIME_DATA.length > 1
                    ? paddingX + (i / (TIME_DATA.length - 1)) * drawWidth
                    : timeChartWidth / 2;
                return (
                  <View
                    key={`label-${p.date}`}
                    style={{
                      position: "absolute",
                      bottom: -55,
                      left: x - 40,
                      width: 80,
                      transform: [{ rotate: "70deg" }],
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h3" style={{ fontSize: 10, color: colors.darkGray }}>
                      {formatDateLabel(p.date)}
                    </Typography>
                  </View>
                );
              })}

              {/* Тултип линейного графика */}
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
                      ? Math.round(selectedTimePoint.point.seconds / dayCards)
                      : 0;
                  const avgDiff =
                    dayCards > 0 ? dayAvgSec - computedAverageSeconds : 0;

                  return (
                    <View
                      style={[
                        styles.tooltip,
                        {
                          width: 130,
                          left: selectedTimePoint.x - 65,
                          top: selectedTimePoint.y - 60,
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
                        <Typography variant="h3" style={styles.tooltip__date}>
                          {formatDateLabel(selectedTimePoint.point.date)}
                        </Typography>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Typography variant="h3" style={styles.tooltip__date}>
                            {dayAvgSec} с
                          </Typography>
                          {avgDiff !== 0 && (
                            <Typography
                              variant="h3"
                              style={[
                                styles.tooltip__date,
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
                      <Typography
                        variant="h3"
                        style={[styles.tooltip__total, { textAlign: "center" }]}
                      >
                        {Math.floor(selectedTimePoint.point.seconds / 60)} мин{" "}
                        {selectedTimePoint.point.seconds % 60} сек
                      </Typography>
                      <View style={[styles.tooltip__arrow, { left: 59 }]} />
                    </View>
                  );
                })()}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Итоговое время */}
      {activeTab === "time" && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h3"
            style={[styles.chart__totalText, { fontWeight: "bold" }]}
          >
            Всего:{" "}
          </Typography>
          <Typography variant="h3" style={styles.chart__totalText}>
            {totalHoursLabel}
          </Typography>
        </View>
      )}

      {/* Легенда */}
      {activeTab === "cards" && (
        <View style={styles.legend}>
          <View style={styles.legend__item}>
            <View
              style={[
                styles.legend__dot,
                { backgroundColor: colors.ratingRed },
              ]}
            />
            <Typography variant="h3">Забыл</Typography>
          </View>
          <View style={styles.legend__item}>
            <View
              style={[
                styles.legend__dot,
                { backgroundColor: colors.ratingYellow },
              ]}
            />
            <Typography variant="h3">Сложно</Typography>
          </View>
          <View style={styles.legend__item}>
            <View
              style={[
                styles.legend__dot,
                { backgroundColor: colors.ratingLightGreen },
              ]}
            />
            <Typography variant="h3">Хорошо</Typography>
          </View>
          <View style={styles.legend__item}>
            <View
              style={[
                styles.legend__dot,
                { backgroundColor: colors.ratingDarkGreen },
              ]}
            />
            <Typography variant="h3">Легко</Typography>
          </View>
        </View>
      )}
      {activeTab === "cards" ? (
        <InfoActivityCards
          visible={isInfoVisible}
          onClose={() => setIsInfoVisible(false)}
        />
      ) : (
        <InfoActivityTime
          visible={isInfoVisible}
          onClose={() => setIsInfoVisible(false)}
        />
      )}
    </View>
  );
}
