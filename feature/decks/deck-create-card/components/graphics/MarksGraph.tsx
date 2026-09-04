
// --------------------------- React ---------------------------
import { useMemo, useState } from "react";

// --------------------------- React Native ---------------------------
import { Image, Pressable, StyleSheet, View } from "react-native";

// --------------------------- SVG ---------------------------
import Svg, { Circle } from "react-native-svg";

// --------------------------- Стили / компоненты ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { commonStyles } from "@/styles/Common";
import IconInfo from "@/assets/icons/IconInfo.png";
// --------------------------- Типы ---------------------------
import { ReviewHistoryEntry } from "@/storage/types/types";

interface MarksGraphProps {
  reviewHistory: ReviewHistoryEntry[];
}

/**
 * 1 — Again/Забыл, 2 — Hard/Сложно, 3 — Good/Хорошо, 4 — Easy/Легко.
 */
const RATING_CONFIG: Record<number, { label: string; color: string }> = {
  4: { label: "Легко", color: colors.ratingDarkGreen },
  3: { label: "Хорошо", color: colors.ratingLightGreen },
  2: { label: "Сложно", color: colors.ratingYellow },
  1: { label: "Забыл", color: colors.ratingRed },
};

// Склонение: 1 повтор / 2 повтора / 5 повторов
const pluralizeReviews = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "повтор";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "повтора";
  return "повторов";
};

export default function MarksGraph({ reviewHistory }: MarksGraphProps) {
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  // Считаем количество каждой оценки из review_history
  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    reviewHistory.forEach((entry) => {
      counts[entry.rating] = (counts[entry.rating] ?? 0) + 1;
    });
    return counts;
  }, [reviewHistory]);

  const totalReviews = reviewHistory.length;

  // У новой карточки ещё не было повторов — блок «Оценки» не показываем
  if (totalReviews === 0) return null;

  // ГЕОМЕТРИЯ КОЛЬЦА (120x120 и толстое кольцо — как в макете Figma)
  const radius = 50;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  // Компенсация скруглённых концов strokeLinecap="round"
  const capPercent = strokeWidth / 2 / circumference;

  // ЛЕГЕНДА: сверху вниз как на дизайне (Легко -> Хорошо -> Сложно -> Забыл)
  const legendOrder = [4, 3, 2, 1];
  const legendSegments = legendOrder.filter((r) => ratingCounts[r] > 0);

  // ГРАФИК: по часовой стрелке от 12 часов (Забыл -> Сложно -> Хорошо -> Легко)
  const chartOrder = [1, 2, 3, 4];
  const chartSegments = chartOrder.filter((r) => ratingCounts[r] > 0);

  let accumulatedPercent = 0;

  return (
    <View style={[commonStyles.mainBox, styles.marksGraph]}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Typography variant="h2">Оценки</Typography>
        <Pressable onPress={() => setIsInfoVisible(true)}>
          <Image source={IconInfo} style={styles.infoIcon} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Пончик */}
        <View style={styles.chartContainer}>
          <Svg
            width={120}
            height={120}
            viewBox="0 0 120 120"
            style={{ transform: [{ rotate: "-90deg" }] }}
          >
            {chartSegments.map((rating) => {
              const config = RATING_CONFIG[rating];
              const percent =
                totalReviews > 0 ? ratingCounts[rating] / totalReviews : 0;

              // Компенсация закруглений
              const adjustedPercent = Math.max(0, percent - capPercent * 2);
              const segmentLength = adjustedPercent * circumference;
              const strokeDasharray = `${segmentLength} ${circumference}`;
              const rotationOffset =
                accumulatedPercent * 360 + capPercent * 360;
              accumulatedPercent += percent;

              return (
                <Circle
                  key={rating}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={config.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform={`rotate(${rotationOffset}, 60, 60)`}
                />
              );
            })}
          </Svg>

          {/* Текст по центру */}
          <View style={styles.chartCenterText}>
            <Typography variant="h2">{totalReviews}</Typography>
            <Typography variant="h3" style={styles.totalLabelText}>
              {pluralizeReviews(totalReviews)} {'\n'}всего
            </Typography>
          </View>
        </View>

        {/* Легенда */}
        <View style={styles.legendContainer}>
          {legendSegments.map((rating) => {
            const config = RATING_CONFIG[rating];
            const percent =
              totalReviews > 0
                ? Math.round((ratingCounts[rating] / totalReviews) * 100)
                : 0;

            return (
              <View key={rating} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendMarker,
                    { backgroundColor: config.color },
                  ]}
                />
                <Typography variant="h3" style={styles.legendText}>
                  {config.label}:{" "}
                  <Typography variant="h3" style={styles.boldText}>
                    {percent}%
                  </Typography>
                </Typography>
              </View>
            );
          })}
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  marksGraph: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  infoIcon: { width: 16, height: 16 },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // пончик + легенда по центру карточки
    width: "100%",
    gap: 40,
    marginBottom: 20
  },
  chartContainer: {
    position: "relative",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  chartCenterText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  totalLabelText: {
    fontSize: 10,
    color: colors.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "column",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: colors.darkMainColor,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: "700",
  },
});
