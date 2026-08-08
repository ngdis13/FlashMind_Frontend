import React, { useState, useEffect, useRef } from "react";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { Pressable, View, Image, StyleSheet, ScrollView, type DimensionValue } from "react-native";
import { styles } from "./styles";
import IconInfo from "@/assets/icons/IconInfo.png";

type ForecastPoint = {
  date: string;
  count: number;
};

interface ForecastGraphProps {
  forecast: ForecastPoint[];
}

const formatDateLabel = (dateStr: string) => {
  const checkDate = new Date(dateStr);
  const months = [
    "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря",
  ];
  const [, , day] = dateStr.split("-");
  return `${parseInt(day)} ${months[checkDate.getMonth()]}`;
};

export default function ForecastGraph({ forecast }: ForecastGraphProps) {
  const [selectedBar, setSelectedBar] = useState<ForecastPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scrollOffsetX, setScrollOffsetX] = useState(0);

  const handleInfo = () => {
    console.log("Информация о прогнозе");
  };

  // Все дни
  const displayData = forecast;

  // Месячные метки: каждые 30 дней
  const monthMarkers = Array.from({ length: Math.ceil(displayData.length / 30) }, (_, m) => ({
    index: m * 30,
    label: m === 0 ? "Текущий мес" : `+${m} мес`,
  }));

  const maxCount = Math.max(...displayData.map((p) => p.count), 10);
  const maxValue = Math.ceil(maxCount * 1.15);

  const handleBarPress = (item: ForecastPoint, index: number) => {
    const barWidthWithGap = 10; // 8 wrapper + 2 margin
    const barHeightPx = (item.count / maxValue) * 200;
    setTooltipPos({ x: index * barWidthWithGap + 17, y: 200 - barHeightPx - 55 });
    setSelectedBar(selectedBar?.date === item.date ? null : item);
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

  return (
    <View style={[commonStyles.mainBox, styles.forecastGraph]}>
      {/* ===== Заголовок ===== */}
      <View style={styles.forecastGraph__headerName}>
        <Typography variant="h2">Прогноз</Typography>
        <Pressable onPress={handleInfo}>
          <Image source={IconInfo} style={styles.forecastGraph__infoIcon} />
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

        {/* Скролл с графиком */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chart__scrollContent}
          onScrollBeginDrag={() => setSelectedBar(null)}
          onScroll={(e) => setScrollOffsetX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          <View style={styles.chart__barsContainer}>
            {/* Сетка */}
            <View style={StyleSheet.absoluteFill}>
              <View style={[styles.chart__gridLine, { top: 0 }]} />
              <View style={[styles.chart__gridLine, { top: "25%" }]} />
              <View style={[styles.chart__gridLine, { top: "50%" }]} />
              <View style={[styles.chart__gridLine, { top: "75%" }]} />
              <View style={[styles.chart__gridLine, { bottom: 0, borderBottomWidth: 2, borderColor: "#E5E5E5" }]} />
            </View>

            {/* Столбики */}
            {displayData.map((point, index) => {
              const barHeight = maxValue > 0 ? `${(point.count / maxValue) * 100}%` : "0%";
              return (
                <Pressable key={index} style={styles.chart__barWrapper} onPress={() => handleBarPress(point, index)}>
                  <View style={[styles.chart__bar, { height: barHeight as DimensionValue }]} />
                </Pressable>
              );
            })}

            {/* Метки месяцев */}
            {monthMarkers.map((m) => (
              <Typography key={m.index} variant="h3" style={[styles.chart__axisText, { position: "absolute", left: m.index * 10 + 8, bottom: -16, zIndex: 1 }]}>
                {m.label}
              </Typography>
            ))}
          </View>
        </ScrollView>

        {/* Тултип */}
        {selectedBar && (
          <View style={[styles.tooltip, { left: tooltipPos.x - scrollOffsetX, top: tooltipPos.y }]}>
            <Typography variant="h3" style={styles.tooltip__date}>{selectedBar.date.includes(" ") ? selectedBar.date : formatDateLabel(selectedBar.date)}</Typography>
            <Typography variant="h3" style={styles.tooltip__count}>{selectedBar.count} карт</Typography>
            <View style={styles.tooltip__arrow} />
          </View>
        )}
      </View>

      {/* ===== Сводная статистика ===== */}
      {(() => {
        const nextDayCount = displayData[0]?.count ?? 0;
        const averageDaily = Math.round(
          displayData.reduce((sum, p) => sum + p.count, 0) / displayData.length,
        );
        const totalViews = displayData.reduce((sum, p) => sum + p.count, 0);

        return (
          <View style={styles.stats__row}>
            <View style={styles.stats__column}>
              <Typography variant="h2" style={styles.stats__value}>{nextDayCount}</Typography>
              <Typography variant="h3" style={styles.stats__label}>на завтра</Typography>
            </View>
            <View style={styles.stats__column}>
              <Typography variant="h2" style={styles.stats__value}>{averageDaily}</Typography>
              <Typography variant="h3" style={styles.stats__label}>в среднем{"\n"}за день</Typography>
            </View>
            <View style={styles.stats__column}>
              <Typography variant="h2" style={styles.stats__value}>{totalViews.toLocaleString("ru-RU")}</Typography>
              <Typography variant="h3" style={styles.stats__label}>всего{"\n"}просмотров</Typography>
            </View>
          </View>
        );
      })()}
    </View>
  );
}
