import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { StarProgress } from "./StarProgress";

interface StarTooltipProps {
  dateStr: string;
  count: number;
  starColor: string;
  isActive: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const StarTooltip = ({
  dateStr,
  count,
  starColor,
  isActive,
  onOpen,
  onClose
}: StarTooltipProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const MONTHS_GENITIVE_RU = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);

    if (!year || !month || !day || month < 1 || month > 12) {
      return dateString;
    }

    return `${day} ${MONTHS_GENITIVE_RU[month - 1]}`;
  };

  const getPluralForm = (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return "повторение";
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
      return "повторения";
    return "повторений";
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive, fadeAnim]);

  const handlePress = () => {
    if (isActive) {
      onClose();
    } else {
      onOpen();
    }
  };

  return (
    <View style={styles.anchor}>
      <Animated.View
        style={[
          styles.tooltipContainer,
          {
            opacity: fadeAnim,
            pointerEvents: isActive ? "auto" : "none",
          },
        ]}
      >
        <View style={styles.tooltipCard}>
          {/* Строка с датой */}
          <Text style={styles.tooltipDate}>{formatDate(dateStr)}</Text>
          {/* Строка с количеством повторений */}
          <Text style={styles.tooltipText}>
            {count} {getPluralForm(count)}
          </Text>
        </View>
        <View style={styles.arrow} />
      </Animated.View>

      <Pressable
        onHoverIn={onOpen}
        onPress={handlePress}
        style={styles.starArea}
      >
        <StarProgress size={24} color={starColor} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  anchor: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  starArea: {
    padding: 4,
    cursor: "pointer",
  },
  tooltipContainer: {
    position: "absolute",
    bottom: 36,
    alignItems: "center",
    width: 140, // Чуть увеличили ширину, чтобы дата и текст гарантированно влезали
    zIndex: 99999,
  },
  tooltipCard: {
    backgroundColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  tooltipDate: {
    color: "#94a3b8", // Серый полупризрачный цвет (Slate-400) для даты
    fontSize: 11,
    fontWeight: "400",
    marginBottom: 2, // Отступ между датой и повторениями
    textAlign: "center",
  },
  tooltipText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    whiteSpace: "nowrap",

    wordBreak: "keep-all",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1e293b",
    marginTop: -1,
  },
});
