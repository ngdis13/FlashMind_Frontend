import React, { useEffect, useRef } from "react";
import { commonStyles } from "@/styles/Common";
import { View, StyleSheet, Image, Pressable, Animated } from "react-native";
import { Typography } from "@/styles/Typography";
import { styles } from "./styles";

import IconInfo from "@/assets/icons/IconInfo.png";

// ==================== Типы ====================
type HourlyPoint = {
  hour_range: string;
  percentage: number;
};

interface ProductivityGraphProps {
  hourlyBreakdown: HourlyPoint[];
}

// ==================== Утилиты ====================
/** "00:00-04:00" → "00-04", "20:00-24:00" → "20-00" */
const formatHourRange = (range: string) =>
  range
    .split("-")
    .map((time) => time.slice(0, 2))
    .join("-")
    .replace("24", "00");

// ==================== Компонент ====================
export default function ProductivityGraph({
  hourlyBreakdown,
}: ProductivityGraphProps) {
  const maxPercentage = 100;

  // Анимация столбиков (пересоздаётся при изменении данных)
  const barAnimations = useRef<Animated.Value[]>([]);
  const prevLength = useRef(0);

  if (hourlyBreakdown.length !== prevLength.current) {
    barAnimations.current = hourlyBreakdown.map(() => new Animated.Value(0));
    prevLength.current = hourlyBreakdown.length;
  }

  useEffect(() => {
    const animations = barAnimations.current.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 500 + i * 80,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }, [hourlyBreakdown]);

  const handleInfo = () => {
    console.log('Информация по продуктивности по часам')
  }

  return (
    <View style={[commonStyles.mainBox, styles.productivityGraph]}>
      {/* ===== Заголовок ===== */}
      <View style={styles.productivityGraph__headerName}>
        <Typography variant="h2">Продуктивность по часам</Typography>
        <Pressable onPress={handleInfo}>
          <Image source={IconInfo} style={styles.productivityGraph__infoIcon} />
        </Pressable>
      </View>

      {/* ===== Блок chart: ось Y + сетка + столбики ===== */}
      <View style={styles.chart}>
        {/* Ось Y: 100% → 0% */}
        <View style={styles.chart__yAxis}>
          <Typography variant="h2" style={styles.chart__axisText}>{maxPercentage}%</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>{maxPercentage * 0.75}%</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>{maxPercentage / 2}%</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>{maxPercentage * 0.25}%</Typography>
          <Typography variant="h2" style={styles.chart__axisText}>0%</Typography>
        </View>

        {/* Область графика */}
        <View style={styles.chart__lines}>
          {/* Сетка: 5 горизонтальных линий */}
          <View style={StyleSheet.absoluteFill}>
            <View style={[styles.chart__gridLine, { top: 0 }]} />
            <View style={[styles.chart__gridLine, { top: "25%" }]} />
            <View style={[styles.chart__gridLine, { top: "50%" }]} />
            <View style={[styles.chart__gridLine, { top: "75%" }]} />
            <View style={[styles.chart__gridLine, { bottom: 0, borderBottomWidth: 2, borderColor: "#E5E5E5" }]} />
          </View>

          {/* Столбики: высота = percentage от maxPercentage */}
          <View style={styles.chart__barsContainer}>
            {hourlyBreakdown.map((p, i) => (
              <View key={p.hour_range} style={styles.chart__barWrapper}>
                <Animated.View
                  style={[
                    styles.chart__bar,
                    {
                      height: barAnimations.current[i]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", `${(p.percentage / maxPercentage) * 100}%`],
                      }),
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Ось X: подписи часовых диапазонов */}
      <View style={styles.chart__xAxis}>
        {hourlyBreakdown.map((p) => (
          <View key={p.hour_range} style={styles.chart__xAxisTextWrapper}>
            <Typography variant="h3" style={styles.chart__axisText}>
              {formatHourRange(p.hour_range)}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}
