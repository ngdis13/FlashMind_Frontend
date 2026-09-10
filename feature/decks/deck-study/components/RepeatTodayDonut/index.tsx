import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import type { Card } from "@/storage/types/types";
import { styles } from "./styles";

interface RepeatTodayDonutProps {
  /** Due-карточки на сегодня (deck.cards_on_study) */
  dueCards: Card[];
  /** Новые карточки, которые добавятся в сессию (addCount) */
  newCount: number;
}

// Классификация по FSRS-сложности — как в статистике: 1-3 / 4-6 / 7-9+
const BUCKETS = [
  { key: "easy", label: "Легкие", color: colors.statusColorGreen },
  { key: "medium", label: "Умеренные", color: colors.statusColorOrange },
  { key: "hard", label: "Сложные", color: colors.statusColorRed },
  { key: "new", label: "Новые", color: colors.statusColorGrey },
] as const;

export default function RepeatTodayDonut({
  dueCards,
  newCount,
}: RepeatTodayDonutProps) {
  // ГЕОМЕТРИЯ КОЛЬЦА (viewBox 150x150, центр 75,75)
  const size = 150;
  const center = size / 2;
  const radius = 55;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  const capLength = strokeWidth / 2;
  const capPercent = capLength / circumference;

  // Разбивка due-карточек по сложности (без оценки — считаем умеренной)
  const difficultyOf = (c: Card) => c.difficulty ?? 5;

  const counts = {
    easy: dueCards.filter((c) => c.in_learning && difficultyOf(c) <= 3).length,
    medium: dueCards.filter((c) => {
      const d = difficultyOf(c);
      return c.in_learning && d > 3 && d <= 6;
    }).length,
    hard: dueCards.filter((c) => c.in_learning && difficultyOf(c) > 6).length,
    // Новые: что добавим в сессию + вдруг сервер положил в due необучаемые
    new: newCount + dueCards.filter((c) => !c.in_learning).length,
  };

  // Сектора кольца: только непустые, по часовой от 12 часов
  const chartSegments = BUCKETS.map((b) => ({ ...b, count: counts[b.key] }))
    .filter((s) => s.count > 0);

  const total = chartSegments.reduce((sum, s) => sum + s.count, 0);

  let accumulatedPercent = 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          {total === 0 ? (
            // Нечего повторять — полное серое кольцо
            <Circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={colors.statusColorGrey}
              strokeWidth={strokeWidth}
            />
          ) : (
            chartSegments.map((segment) => {
              const percent = segment.count / total;

              // Компенсация закруглений (как в CardsStatusGraph)
              const adjustedPercent = Math.max(0, percent - capPercent * 2);
              const segmentLength = adjustedPercent * circumference;
              const strokeDasharray = `${segmentLength} ${circumference}`;
              const rotationOffset =
                accumulatedPercent * 360 + capPercent * 360;
              accumulatedPercent += percent;

              return (
                <Circle
                  key={segment.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform={`rotate(${rotationOffset}, ${center}, ${center})`}
                />
              );
            })
          )}
        </Svg>

        {/* Текст по центру */}
        <View style={styles.chartCenterText}>
          <Typography variant="h2">{total}</Typography>
          <Typography variant="h3" style={styles.totalLabel}>
            к повтору{"\n"}сегодня
          </Typography>
        </View>
      </View>

      {/* Легенда: все 4 группы, порядок как в макете */}
      <View style={styles.legendContainer}>
        {BUCKETS.map((bucket) => (
          <View key={bucket.key} style={styles.legendItem}>
            <View
              style={[styles.legendMarker, { backgroundColor: bucket.color }]}
            />
            <Typography variant="h3" style={styles.legendText}>
              {bucket.label}:{" "}
              <Typography variant="h3" style={styles.boldText}>
                {counts[bucket.key]}
              </Typography>
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}