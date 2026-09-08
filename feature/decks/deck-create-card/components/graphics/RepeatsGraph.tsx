// --------------------------- React ---------------------------
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";

// --------------------------- React Native ---------------------------
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

// --------------------------- SVG ---------------------------
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Polyline,
  Rect,
  Stop,
} from "react-native-svg";

// --------------------------- Стили / компоненты ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { commonStyles } from "@/styles/Common";
import IconInfo from "@/assets/icons/IconInfo.png";

// --------------------------- Типы ---------------------------
import { ReviewHistoryEntry } from "@/storage/types/types";

// ==================== Типы ====================

/** Агрегированные данные одного дня для графика «Повторы» */
export interface RepetitionDayData {
  dateKey: string; // "2024-08-04"
  dateLabel: string; // "4 Августа"
  difficulty: number; // сложность последнего ревью дня (0–10)
  difficultyDelta: number | null; // изменение к предыдущему ревью
  stabilityDays: number; // стабильность последнего ревью дня (в днях)
  stabilityDelta: number | null;
  timeSpentSec: number; // суммарное время повторов за день
  answers: { forgot: number; hard: number; good: number; easy: number };
}

interface RepeatsGraphProps {
  reviewHistory: ReviewHistoryEntry[];
}

// ==================== Константы ====================
const CHART_HEIGHT = 200; // высота области столбиков/линии
const MAX_VALUE = 10; // фиксированная ось 0..10
const DAY_SPACING = 44; // ширина колонки дня (как в «Активности»)
const LEFT_MARGIN = 4; // поле слева внутри полотна: сетка доходит до оси
const Y_AXIS_WIDTH = 26; // ширина колонки оси Y — нужна для тултипа
const BAR_WIDTH = 15; // ширина столбика
const BAR_RADIUS = 4; // скругление верхних углов
const TOOLTIP_WIDTH = 180;
const TOOLTIP_BG = "#1E1F4B";
const GRID_COLOR = "#E5E5EA";

// Секции столбика снизу вверх (по ТЗ)
const SECTIONS = [
  { key: "easy", label: "Легко", color: "#96FFAB" },
  { key: "good", label: "Хорошо", color: "#B6FFC4" },
  { key: "hard", label: "Сложно", color: "#FFFFA6" },
  { key: "forgot", label: "Забыл", color: "#FFA6B2" },
] as const;

const MONTHS = [
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

// ==================== Утилиты ====================
const formatDateLabel = (dateKey: string): string => {
  const day = parseInt(dateKey.slice(8, 10), 10);
  const month = parseInt(dateKey.slice(5, 7), 10) - 1;
  return `${day} ${MONTHS[month] ?? ""}`;
};

const pluralizeDays = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
};

const formatTime = (sec: number): string => {
  if (sec < 60) return `${sec} сек`;
  return `${Math.floor(sec / 60)} мин ${sec % 60} сек`;
};

const formatDelta = (delta: number, digits = 0): string =>
  `(${delta > 0 ? "+" : ""}${delta.toFixed(digits)})`;

/** Path прямоугольника со скруглёнными ТОЛЬКО верхними углами */
const topRoundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string =>
  [
    `M ${x} ${y + h}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");

// ==================== Агрегация review_history по дням ====================
export const buildRepetitionDays = (
  history: ReviewHistoryEntry[],
): RepetitionDayData[] => {
  if (history.length === 0) return [];

  const sorted = [...history].sort(
    (a, b) => Date.parse(a.review_datetime) - Date.parse(b.review_datetime),
  );

  // Группируем по дате из ISO, чтобы не зависеть от таймзоны устройства
  const dayKeys: string[] = [];
  const byDay = new Map<string, ReviewHistoryEntry[]>();
  sorted.forEach((entry) => {
    const key = entry.review_datetime.slice(0, 10);
    let list = byDay.get(key);
    if (!list) {
      list = [];
      byDay.set(key, list);
      dayKeys.push(key);
    }
    list.push(entry);
  });

  // Последние 30 дней с повторами, новые слева
  return dayKeys
    .slice(-30)
    .reverse()
    .map((key) => {
      const entries = byDay.get(key)!;
      const last = entries[entries.length - 1];
      const lastIndex = sorted.indexOf(last);
      const prev = lastIndex > 0 ? sorted[lastIndex - 1] : null;

      const answers = { forgot: 0, hard: 0, good: 0, easy: 0 };
      let timeMs = 0;
      entries.forEach((e) => {
        timeMs += e.review_duration_ms;
        if (e.rating === 1) answers.forgot += 1;
        else if (e.rating === 2) answers.hard += 1;
        else if (e.rating === 3) answers.good += 1;
        else if (e.rating === 4) answers.easy += 1;
      });

      return {
        dateKey: key,
        dateLabel: formatDateLabel(key),
        difficulty: last.difficulty,
        difficultyDelta: prev ? last.difficulty - prev.difficulty : null,
        stabilityDays: last.stability,
        stabilityDelta: prev ? last.stability - prev.stability : null,
        timeSpentSec: Math.round(timeMs / 1000),
        answers,
      };
    });
};

// ==================== МОК-ДАННЫЕ (только для тестов вида) ====================
// TODO: удалить после подключения реальных данных
export const MOCK_REVIEW_HISTORY: ReviewHistoryEntry[] = (() => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const list: ReviewHistoryEntry[] = [];
  for (let day = 0; day < 21; day++) {
    const reviewsInDay = 2 + (day % 3); // 2..4 ревью в день
    for (let r = 0; r < reviewsInDay; r++) {
      const seed = day * 10 + r;
      // Реалистичная кривая обучения:
      // - первые 5 дней высокая сложность 6–9 (красная зона)
      // - дни 6–12 средняя сложность 4–7 (переход в сиреневую зону)
      // - дни 13–20 низкая сложность 1.5–4 (зелёная зона)
      const baseDifficulty =
        day < 5
          ? 7.5 + ((seed * 11) % 15) * 0.15 // 7.5..9.7
          : day < 12
            ? 5.5 + ((seed * 7) % 18) * 0.12 - 0.5 * (day - 5) // 4.0..7.0, плавное снижение
            : 3.0 + ((seed * 13) % 12) * 0.1 - 0.15 * (day - 12); // 1.5..4.0

      list.push({
        review_datetime: new Date(
          Date.now() - day * DAY_MS - r * 60 * 60 * 1000,
        ).toISOString(),
        rating: (((seed * 5) % 4) + 1) as 1 | 2 | 3 | 4,
        difficulty: Math.max(1.0, Math.min(10.0, baseDifficulty)),
        stability: Math.max(1, Math.round(day * 0.7 + 1 + (seed % 3))),
        review_duration_ms: (3 + ((seed * 7) % 8)) * 1000,
      });
    }
  }
  return list;
})();

// ==================== Компонент ====================
export default function RepeatsGraph({ reviewHistory }: RepeatsGraphProps) {
  const days = useMemo(
    () => buildRepetitionDays(reviewHistory),
    [reviewHistory],
  );

  // Динамический максимум оси: минимум 10, растёт, если данных больше
  const maxValue = useMemo(() => {
    if (days.length === 0) return MAX_VALUE;
    const maxDifficulty = Math.max(...days.map((d) => d.difficulty));
    const maxTotal = Math.max(
      ...days.map(
        (d) =>
          d.answers.easy + d.answers.good + d.answers.hard + d.answers.forgot,
      ),
    );
    const rawMax = Math.max(maxDifficulty, maxTotal, MAX_VALUE);
    // округляем вверх до ближайшего чётного — деления остаются целыми с шагом 2
    return Math.ceil(rawMax / 2) * 2;
  }, [days]);

  // Деления оси Y от максимума до 0 с шагом 2
  const yTicks: number[] = [];
  for (let v = maxValue; v >= 0; v -= 2) yTicks.push(v);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);

  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Авто-скрытие тултипа через 3 сек (как в «Активности»)
  useEffect(() => {
    if (selectedKey) {
      tooltipTimer.current = setTimeout(() => setSelectedKey(null), 3000);
    }
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, [selectedKey]);

  if (days.length === 0) return null;

  // Полотно минимум на всю видимую ширину — сетка не обрезается,
  // если дней мало; при избытке дней график скроллится
  const chartWidth = Math.max(
    LEFT_MARGIN + days.length * DAY_SPACING,
    visibleWidth,
  );
  // x-координата центра колонки дня (с учётом левого поля полотна)
  const dayX = (i: number) => LEFT_MARGIN + i * DAY_SPACING;
  const selectedIndex = days.findIndex((d) => d.dateKey === selectedKey);
  const selectedDay = selectedIndex >= 0 ? days[selectedIndex] : null;

  return (
    <View style={[commonStyles.mainBox, styles.repeatsGraph]}>
      {/* Заголовок с кнопкой (i) */}
      <View style={styles.header}>
        <Typography variant="h2">Повторы</Typography>
        {/* TODO: подключить поп-ап с пояснением графика */}
        <Pressable onPress={() => {}}>
          <Image source={IconInfo} style={styles.infoIcon} />
        </Pressable>
      </View>

      <View style={styles.chart}>
        {/* Ось Y — деления от максимума до 0 с шагом 2 */}
        <View style={styles.yAxis}>
          {yTicks.map((v) => (
            <Typography key={v} variant="h3" style={styles.yAxisText}>
              {v}
            </Typography>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScrollBeginDrag={() => setSelectedKey(null)}
          onScroll={(e) => setScrollOffsetX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          onLayout={(e) => setVisibleWidth(e.nativeEvent.layout.width)}
        >
          <View style={{ width: chartWidth, height: CHART_HEIGHT }}>
            {/* Сетка 0..10, столбики, линия сложности, зоны тапа */}
            <Svg width={chartWidth} height={CHART_HEIGHT}>
              {/* Вертикальный градиент сложности: верх (красный) -> середина (сиреневый) -> низ (зелёный) */}
              <Defs>
                <LinearGradient
                  id="difficultyGradient"
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={CHART_HEIGHT}
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0%" stopColor={colors.red1} stopOpacity="1" />
                  <Stop offset="50%" stopColor={colors.ratingYellow} stopOpacity="1" />
                  <Stop offset="100%" stopColor={colors.ratingDarkGreen} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              {/* Сетка — линии по делениям оси Y */}
              {yTicks.map((v) => (
                <Line
                  key={v}
                  x1={0}
                  x2={chartWidth}
                  y1={CHART_HEIGHT - v * (CHART_HEIGHT / maxValue)}
                  y2={CHART_HEIGHT - v * (CHART_HEIGHT / maxValue)}
                  stroke={GRID_COLOR}
                  strokeWidth={v === 0 ? 2 : 1}
                />
              ))}

              {/* Столбики (снизу вверх: Легко -> Хорошо -> Сложно -> Забыл) */}
              {days.map((day, i) => {
                const total =
                  day.answers.easy +
                  day.answers.good +
                  day.answers.hard +
                  day.answers.forgot;
                if (total === 0) return null;
                // защита от выхода за ось
                const factor = total > maxValue ? maxValue / total : 1;
                let stackBottom = CHART_HEIGHT;

                const segments = SECTIONS.map((s) => {
                  const h =
                    day.answers[s.key] * (CHART_HEIGHT / maxValue) * factor;
                  const y = stackBottom - h;
                  stackBottom = y;
                  return { ...s, h, y };
                }).filter((s) => s.h > 0.01);

                const x = dayX(i) + (DAY_SPACING - BAR_WIDTH) / 2;

                return (
                  <Fragment key={day.dateKey}>
                    {segments.map((s, si) =>
                      si === segments.length - 1 ? (
                        // верхний сегмент — скругляем только верхние углы
                        <Path
                          key={s.key}
                          d={topRoundedRect(x, s.y, BAR_WIDTH, s.h, BAR_RADIUS)}
                          fill={s.color}
                        />
                      ) : (
                        <Rect
                          key={s.key}
                          x={x}
                          y={s.y}
                          width={BAR_WIDTH}
                          height={s.h}
                          fill={s.color}
                        />
                      ),
                    )}
                  </Fragment>
                );
              })}

              {/* Линия сложности поверх столбиков */}
              <Polyline
                points={days
                  .map(
                    (d, i) =>
                      `${dayX(i) + DAY_SPACING / 2},${
                        CHART_HEIGHT - d.difficulty * (CHART_HEIGHT / maxValue)
                      }`,
                  )
                  .join(" ")}
                fill="none"
                stroke="url(#difficultyGradient)"
                strokeWidth={3}
                strokeLinejoin="round"
              />
              {days.map((d, i) => (
                <Circle
                  key={d.dateKey}
                  cx={dayX(i) + DAY_SPACING / 2}
                  cy={CHART_HEIGHT - d.difficulty * (CHART_HEIGHT / maxValue)}
                  r={5}
                  fill={
                    d.difficulty >= 7
                      ? colors.red1
                      : d.difficulty <= 4
                        ? colors.ratingDarkGreen
                        : colors.ratingYellow
                  }
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
              ))}

              {/* Прозрачные зоны тапа на всю колонку дня */}
              {days.map((day, i) => (
                <Rect
                  key={`tap-${day.dateKey}`}
                  x={dayX(i)}
                  y={0}
                  width={DAY_SPACING}
                  height={CHART_HEIGHT}
                  fill="transparent"
                  onPress={() =>
                    setSelectedKey((prev) =>
                      prev === day.dateKey ? null : day.dateKey,
                    )
                  }
                />
              ))}
            </Svg>

            {/* Подписи дней, повернутые на -45° */}
            {days.map((day, i) => (
              <View
                key={`label-${day.dateKey}`}
                pointerEvents="none"
                style={[
                  styles.xLabel,
                  { left: dayX(i) + DAY_SPACING / 2 - 45 },
                ]}
              >
                <Typography variant="h3" style={styles.xLabelText}>
                  {day.dateLabel}
                </Typography>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Тултип по тапу на столбик */}
        {selectedDay &&
          (() => {
            const currentDay = selectedDay;
            const total =
              selectedDay.answers.easy +
              selectedDay.answers.good +
              selectedDay.answers.hard +
              selectedDay.answers.forgot;
            const barTopY =
              CHART_HEIGHT -
              Math.min(total, maxValue) * (CHART_HEIGHT / maxValue);
            const rawLeft =
              Y_AXIS_WIDTH +
              LEFT_MARGIN +
              selectedIndex * DAY_SPACING +
              DAY_SPACING / 2 -
              TOOLTIP_WIDTH / 2 -
              scrollOffsetX;
            const maxLeft =
              visibleWidth > TOOLTIP_WIDTH
                ? visibleWidth - TOOLTIP_WIDTH + Y_AXIS_WIDTH - 4
                : undefined;
            const left =
              maxLeft !== undefined
                ? Math.min(Math.max(rawLeft, 4), maxLeft)
                : rawLeft;
            const top = Math.max(4, barTopY - 88); // ближе к столбику

            // 1. СЛОЖНОСТЬ: Если дельта меньше или равна 0 (падает) -> хорошо (зелёный), если растёт -> плохо (красный)
            const isDifficultyGood =
              selectedDay.difficultyDelta !== null &&
              selectedDay.difficultyDelta <= 0;
            const difficultyDeltaColor = isDifficultyGood
              ? colors.ratingDarkGreen
              : colors.ratingRed;

            // 2. СТАБИЛЬНОСТЬ: Если дельта больше или равна 0 (растёт) -> хорошо (зелёный), если падает -> плохо (красный)
            const isStabilityGood =
              selectedDay.stabilityDelta !== null &&
              selectedDay.stabilityDelta >= 0;
            const stabilityDeltaColor = isStabilityGood
              ? colors.ratingDarkGreen
              : colors.ratingRed;

            return (
              <View
                pointerEvents="none"
                style={[styles.tooltip, { left, top }]}
              >
                <View style={styles.tooltipHeader}>
                  <Typography variant="h3" style={styles.tooltipDate}>
                    {currentDay.dateLabel}
                  </Typography>
                  <Typography variant="h3" style={styles.tooltipTime}>
                    {formatTime(currentDay.timeSpentSec)}
                  </Typography>
                </View>

                <Typography variant="h3" style={styles.tooltipLine}>
                  Сложность: {currentDay.difficulty.toFixed(1)}
                  {currentDay.difficultyDelta !== null && (
                    <Typography
                      variant="h3"
                      style={{ fontSize: 10, color: difficultyDeltaColor }}
                    >
                      {` ${formatDelta(currentDay.difficultyDelta, 1)}`}
                    </Typography>
                  )}
                </Typography>

                <Typography variant="h3" style={styles.tooltipLine}>
                  Стабильность: {currentDay.stabilityDays}{" "}
                  {pluralizeDays(currentDay.stabilityDays)}
                  {currentDay.stabilityDelta !== null && (
                    <Typography
                      variant="h3"
                      style={{ fontSize: 10, color: stabilityDeltaColor }}
                    >
                      {` ${formatDelta(currentDay.stabilityDelta)}`}
                    </Typography>
                  )}
                </Typography>

                <Svg width={14} height={8} style={styles.tooltipArrow}>
                  <Polygon points="0,0 14,0 7,8" fill={TOOLTIP_BG} />
                </Svg>
              </View>
            );
          })()}
      </View>

      {/* Легенда */}
      <View style={styles.legend}>
        {[...SECTIONS].reverse().map((s) => (
          <View key={s.key} style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: s.color }]} />
            <Typography variant="h3" style={styles.legendText}>
              {s.label}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  repeatsGraph: {
    padding: 20, // как у графика «Оценки»
  },
  header: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  infoIcon: { width: 16, height: 16 },
  chart: {
    flexDirection: "row",
    position: "relative",
  },
  yAxis: {
    width: 26,
    height: CHART_HEIGHT,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 6,
    borderRightWidth: 2,
    borderRightColor: colors.lightGray,
  },
  yAxisText: {
    fontSize: 10,
    color: colors.darkGray,
  },
  scrollContent: {
    paddingRight: 12,
    paddingBottom: 85, // запас под даты, повёрнутые на -70°
  },
  xLabel: {
    position: "absolute",
    bottom: -35, // даты подняты ближе к оси, чтобы были видны целиком
    width: 90,
    transform: [{ rotate: "-70deg" }],
  },
  xLabelText: {
    fontSize: 10,
    color: colors.darkGray,
  },
  tooltip: {
    position: "absolute",
    width: TOOLTIP_WIDTH,
    backgroundColor: TOOLTIP_BG,
    borderRadius: 10,
    padding: 10,
    zIndex: 999,
    elevation: 999,
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tooltipDate: {
    fontSize: 10,
    color: "#ADAFCA",
  },
  tooltipTime: {
    fontSize: 10,
    color: colors.white,
  },
  tooltipLine: {
    fontSize: 10,
    color: colors.white,
    marginTop: 2,
  },
  tooltipDelta: {
    fontSize: 10,
    color: "#9A9BC0",
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -8,
    left: TOOLTIP_WIDTH / 2 - 7,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: colors.darkMainColor,
  },
});
