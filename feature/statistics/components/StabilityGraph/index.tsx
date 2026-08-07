import { commonStyles } from "@/styles/Common";
import { Pressable, View, Image, StyleSheet } from "react-native";
import { styles } from "./style";
import { Typography } from "@/styles/Typography";
import IconInfo from "@/assets/icons/IconInfo.png";

type StabilityPoint = {
  range_label: string;
  count: number;
};

interface StabilityGraphProps {
  stabilityDistribution: StabilityPoint[];
  averageStability?: string;
}

export default function StabilityGraph({
  stabilityDistribution,
  averageStability = "42 дня",
}: StabilityGraphProps) {
  const handleInfo = () => {
    console.log("Информация о стабильности");
  };

  // 1. Находим чистый максимум из данных
  const rawMax = stabilityDistribution.reduce((max, item) => Math.max(max, item.count), 0);
  
  // 2. Добавляем 15% запаса для "воздуха" сверху и округляем в большую сторону до красивого числа (кратно 20)
  const calculatedMax = rawMax > 0 ? Math.ceil((rawMax * 1.15) / 20) * 20 : 100;
  const maxValue = calculatedMax;

  return (
    <View style={[commonStyles.mainBox, styles.stabilityGraph]}>
      {/* ===== Заголовок ===== */}
      <View style={styles.stabilityGraph__headerName}>
        <Typography variant="h2">Стабильность</Typography>
        <Pressable onPress={handleInfo}>
          <Image source={IconInfo} style={styles.stabilityGraph__infoIcon} />
        </Pressable>
      </View>

      {/* ===== Блок chart ===== */}
      <View style={styles.chart}>
        {/* Ось Y */}
        <View style={styles.chart__yAxis}>
          <Typography variant="h2" style={styles.chart__axisText}>{maxValue}</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>{Math.round(maxValue * 0.75)}</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>{Math.round(maxValue / 2)}</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>{Math.round(maxValue * 0.25)}</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>0</Typography>
        </View>

        {/* Рабочая область графика */}
        <View style={styles.chart__content}>
          <View style={styles.chart__lines}>
            {/* Сетка (горизонтальные линии) */}
            <View style={StyleSheet.absoluteFill}>
              <View style={[styles.chart__gridLine, { top: 0 }]} />
              <View style={[styles.chart__gridLine, { top: "25%" }]} />
              <View style={[styles.chart__gridLine, { top: "50%" }]} />
              <View style={[styles.chart__gridLine, { top: "75%" }]} />
            </View>

            {/* Контейнер для столбцов поверх сетки */}
            <View style={styles.chart__barsContainer}>
              {stabilityDistribution.map((item, index) => {
                // Расчет высоты в процентах относительно динамического maxValue
                const barHeightPercentage = maxValue > 0 ? (item.count / maxValue) * 100 : 0;

                return (
                  <View key={index} style={styles.chart__column}>
                    {/* Значение над столбцом */}
                    <Typography variant="h3" style={styles.chart__barValue}>
                      {item.count}
                    </Typography>
                    {/* Сам столбец */}
                    <View style={[styles.chart__bar, { height: `${barHeightPercentage}%` }]} />
                  </View>
                );
              })}
            </View>
          </View>

          {/* Ось X (подписи под столбцами) */}
          <View style={styles.chart__xAxis}>
            {stabilityDistribution.map((item, index) => (
              <Typography key={index} variant="h3" style={styles.chart__xAxisText}>
                {item.range_label}
              </Typography>
            ))}
          </View>
        </View>
      </View>

      {/* ===== Нижняя подпись: Средняя стабильность ===== */}
      <View style={styles.stabilityGraph__footer}>
        <Typography variant="h3">
          Средняя стабильность: {averageStability}
        </Typography>
      </View>
    </View>
  );
}
