import { useState } from "react";
import { commonStyles } from "@/styles/Common";
import { Pressable, View, Image } from "react-native";
import { styles } from "./styles";
import { Typography } from "@/styles/Typography";
import IconInfo from "@/assets/icons/IconInfo.png";
import { colors } from "@/styles/Colors";
import Svg, { Circle, G } from "react-native-svg";
import { InfoCardsStatus } from "./components/InfoCardsStatus";

type CardTypePoint = {
  card_type: string;
  count: number;
};

interface CardsStatusGraphProps {
  cardTypes: CardTypePoint[];
  isWide?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  отложенные: { label: "Отложенные", color: colors.statusColorRed },
  новые: { label: "Новые", color: colors.statusColorGrey },
  изученные: { label: "Изученные", color: colors.statusColorGreen },
  изучаемые: { label: "Изучаемые", color: colors.statusColorYellow },
};

export default function CardsStatusGraph({
  cardTypes,
  isWide,
}: CardsStatusGraphProps) {
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const handleInfo = () => {
    setIsInfoVisible(true);
  };

  const totalCards = cardTypes.reduce((sum, item) => sum + item.count, 0);

  // ГЕОМЕТРИЯ КОЛЬЦА (под viewBox 130x130, центр в точке 65, 65)
  const radius = 48;
  const strokeWidth = 14; // Изящная толщина кольца из дизайна
  const circumference = 2 * Math.PI * radius; // Длина окружности (~301.6)

  // Переводим толщину линии в радианы/градусы, чтобы узнать точный размер скругленного "капюшона"
  // Это компенсирует наложение strokeLinecap="round"
  const capLength = strokeWidth / 2;
  const capPercent = capLength / circumference;

  // ПОРЯДОК ДЛЯ ЛЕГЕНДЫ: строго как на дизайне (сверху вниз)
  const legendOrder = ["изученные", "изучаемые", "отложенные", "новые"];
  const legendSegments = legendOrder
    .map((type) => cardTypes.find((item) => item.card_type === type))
    .filter((item): item is CardTypePoint => item !== undefined);

  // ПОРЯДОК ДЛЯ ГРАФИКА: по часовой стрелке с 12 часов (Красный -> Серый -> Зеленый -> Желтый)
  const chartOrder = ["отложенные", "новые", "изученные", "изучаемые"];
  const chartSegments = chartOrder
    .map((type) => cardTypes.find((item) => item.card_type === type))
    .filter(
      (item): item is CardTypePoint => item !== undefined && item.count > 0,
    );

  // Накапливаем пройденный процент для вращения секторов
  let accumulatedPercent = 0;

  return (
    <View
      style={[
        commonStyles.mainBox,
        styles.cardsStatusGraph,
        isWide && { flex: 1, justifyContent: "center" },
      ]}
    >
      {/* Заголовок */}
      <View style={styles.cardsStatusGraph__header}>
        <Typography variant="h2">Прогресс обучения</Typography>
        <Pressable onPress={handleInfo}>
          <Image source={IconInfo} style={styles.cardsStatusGraph__infoIcon} />
        </Pressable>
      </View>

      <View
        style={[
          styles.cardsStatusGraph__content,
          isWide && { flexDirection: "column", alignItems: "center", gap: 8 },
        ]}
      >
        <View style={styles.chartContainer}>
          {/* Перенесли поворот на -90 градусов в стиль самого Svg */}
          <Svg
            width={130}
            height={130}
            viewBox="0 0 130 130"
            style={{ transform: [{ rotate: "-90deg" }] }}
          >
            {chartSegments.map((item) => {
              const config = STATUS_CONFIG[item.card_type] || {
                label: item.card_type,
                color: colors.statusColorGrey,
              };

              const percent = totalCards > 0 ? item.count / totalCards : 0;

              // Магическая компенсация закруглений
              const adjustedPercent = Math.max(0, percent - capPercent * 2);
              const segmentLength = adjustedPercent * circumference;
              const strokeDasharray = `${segmentLength} ${circumference}`;

              // Поворот каждого отдельного круга внутри Svg
              const rotationOffset =
                accumulatedPercent * 360 + capPercent * 360;

              accumulatedPercent += percent;

              return (
                <Circle
                  key={item.card_type}
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="transparent"
                  stroke={config.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform={`rotate(${rotationOffset}, 65, 65)`}
                />
              );
            })}
          </Svg>

          {/* Текст по центру */}
          <View style={styles.chartCenterText}>
            <Typography variant="h2">
              {totalCards.toLocaleString("ru-RU")}
            </Typography>
            <Typography variant="h3" style={styles.totalLabelText}>
              карт всего
            </Typography>
          </View>
        </View>

        {/* Легенда отображается в правильном независимом порядке */}
        <View
          style={[
            styles.legendContainer,
            isWide && {
              flex: 0,
              width: "100%",
              paddingLeft: 0,
              alignItems: "center",
            },
          ]}
        >
          {legendSegments.map((item) => {
            const config = STATUS_CONFIG[item.card_type] || {
              label: item.card_type,
              color: colors.statusColorGrey,
            };
            const percent =
              totalCards > 0 ? Math.round((item.count / totalCards) * 100) : 0;

            return (
              <View key={item.card_type} style={styles.legendItem}>
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
                  </Typography>{" "}
                  ({item.count} шт)
                </Typography>
              </View>
            );
          })}
        </View>
      </View>
      <InfoCardsStatus
        visible={isInfoVisible}
        onClose={() => setIsInfoVisible(false)}
      />
    </View>
  );
}
