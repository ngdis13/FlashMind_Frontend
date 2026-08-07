import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { Pressable, View, Image, StyleSheet, type DimensionValue } from "react-native";
import IconInfo from "@/assets/icons/IconInfo.png";
import { styles } from "./styles";

type DifficultyPoint = {
  range_label: string; // Сложность: "1", "2", ..., "9+"
  count: number; // Количество карточек (высота по Y)
};

interface DifficultyCardsGraphProps {
  difficultyDistribution: DifficultyPoint[];
}

const BAR_COLORS = [
  colors.diffGreen,
  colors.diffGreen2,
  colors.diffGreen3,
  colors.diffYellow1,
  colors.diffYellow2,
  colors.diffYellow3,
  colors.diffRed1,
  colors.diffRed2,
  colors.diffRed3,
];

export default function DifficultyCardsGraph({
  difficultyDistribution = [],
}: DifficultyCardsGraphProps) {
  const handleInfo = () => {
    console.log("Информация о сложности карточек");
  };

  // 1. Максимум по оси Y (количество карточек) из данных
  const maxCount = Math.max(...difficultyDistribution.map((d) => d.count), 0);

  // 2. Добавляем 15% воздуха для графика и округляем
  const calculatedMax = maxCount > 0 ? maxCount * 1.15 : 100;
  const maxValue = Math.ceil(calculatedMax);

  // 3. Шаги для сетки оси Y
  const step75 = Math.round(maxValue * 0.75);
  const step50 = Math.round(maxValue * 0.5);
  const step25 = Math.round(maxValue * 0.25);

  // 4. ПРАВИЛЬНЫЙ расчет средней сложности:
  // Суммируем (Количество карточек * Значение сложности) / Общее количество карточек
  const totalCards = difficultyDistribution.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const totalWeight = difficultyDistribution.reduce((sum, item) => {
    // Превращаем "9+" или "1" в чистое число для математики
    const difficultyValue = parseInt(item.range_label, 10) || 9;
    return sum + item.count * difficultyValue;
  }, 0);

  const averageDifficulty =
    totalCards > 0 ? (totalWeight / totalCards).toFixed(1) : "0.0";

  return (
    <View style={[commonStyles.mainBox, styles.difficultyCardsGraph]}>
      {/* ===== Заголовок ===== */}
      <View style={styles.difficultyCardsGraph__headerName}>
        <Typography variant="h2">Сложность карточек</Typography>
        <Pressable onPress={handleInfo}>
          <Image
            source={IconInfo}
            style={styles.difficultyCardsGraph__infoIcon}
          />
        </Pressable>
      </View>

      {/* ===== Блок chart ===== */}
      <View style={styles.chart}>
        {/* Ось Y (Количество карточек) */}
        <View style={styles.chart__yAxis}>
          <Typography variant="h2" style={styles.chart__axisText}>
            {maxValue}
          </Typography>
          <Typography variant="h2" style={styles.chart__axisText}>
            {step75}
          </Typography>
          <Typography variant="h2" style={styles.chart__axisText}>
            {step50}
          </Typography>
          <Typography variant="h2" style={styles.chart__axisText}>
            {step25}
          </Typography>
          <Typography variant="h2" style={styles.chart__axisText}>
            0
          </Typography>
        </View>

        {/* Область сетки и столбцов */}
        <View style={styles.chart__lines}>
          {/* Сетка */}
          <View style={StyleSheet.absoluteFill}>
            <View style={[styles.chart__gridLine, { top: 0 }]} />
            <View style={[styles.chart__gridLine, { top: "25%" }]} />
            <View style={[styles.chart__gridLine, { top: "50%" }]} />
            <View style={[styles.chart__gridLine, { top: "75%" }]} />
            <View
              style={[
                styles.chart__gridLine,
                { bottom: 0, borderBottomWidth: 1 },
              ]}
            />
          </View>

          {/* Столбцы */}
          <View style={styles.chart__barsContainer}>
            {difficultyDistribution.map((item, index) => {
              const barHeight =
                maxValue > 0 ? `${(item.count / maxValue) * 100}%` : "0%";
              const barColor = BAR_COLORS[index] || colors.diffRed3;

              return (
                <View key={index} style={styles.chart__barWrapper}>
                  <View
                    style={[
                      styles.chart__bar,
                      { height: barHeight as DimensionValue, backgroundColor: barColor },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* ===== Ось X (Уровень сложности карточек) ===== */}
      <View style={styles.chart__xAxis}>
        {difficultyDistribution.map((item, index) => (
          <View key={index} style={styles.chart__xLabelWrapper}>
            <Typography variant="h2" style={styles.chart__axisText}>
              {parseInt(item.range_label, 10)}
            </Typography>
          </View>
        ))}
      </View>

      {/* ===== Средняя сложность ===== */}
      <View style={styles.difficultyCardsGraph__footer}>
        <Typography
          variant="h3"
        >
          Средняя сложность: {averageDifficulty}
        </Typography>
      </View>
    </View>
  );
}
