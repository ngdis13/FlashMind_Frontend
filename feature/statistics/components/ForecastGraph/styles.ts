import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ==================== БЛОК: forecastGraph ====================
  forecastGraph: {
    flexDirection: "column",
    paddingVertical: 20,
    paddingHorizontal: 12,
    position: "relative",
  },

  // ===== Хедер =====
  forecastGraph__header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  forecastGraph__headerName: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  forecastGraph__infoIcon: {
    width: 16,
    height: 16,
    padding: 6,
  },

  // ===== Переключатель =====
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.light2MainColor,
    borderRadius: 14,
    padding: 4,
    position: "relative",
  },
  toggle__slider: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: 88,
    backgroundColor: colors.mainNumber,
    borderRadius: 12,
  },
  toggle__button: {
    width: 88,
    height: 33,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  // ==================== БЛОК: chart ====================
  chart: {
    flexDirection: "row",
    width: "100%",
    position: "relative",
    marginBottom: 8,
    right: 12
  },
  chart__yAxis: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingRight: 12,
    width: 45,
    borderRightWidth: 2,
    borderRightColor: colors.lightGray,
  },
  chart__axisText: {
    fontSize: 11,
    color: colors.darkGray,
  },
  chart__gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },

  // ===== Скролл-область с графиком =====
  chart__scrollContent: {
    paddingBottom: 80,
  },
  chart__barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 200,
    position: "relative",
    paddingLeft: 8,
    paddingRight: 8,
  },

  // ===== Столбики =====
  chart__barWrapper: {
    alignItems: "center",
    width: 16,
    marginRight: 12,
    height: "100%",
    justifyContent: "flex-end",
  },
  chart__bar: {
    width: 16,
    backgroundColor: colors.mainColor,
  },

  // ===== Ось X =====
  chart__xLabel: {
    position: "absolute",
    bottom: -45,
    left: "70%",
    marginLeft: -40,
    width: 80,
    transform: [{ rotate: "70deg" }],
    alignItems: "center",
  },
  chart__xLabelText: {
    fontSize: 10,
    color: colors.darkGray,
  },

  // ==================== СВОДНАЯ СТАТИСТИКА ====================
  stats__row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  stats__column: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  stats__value: {
    fontWeight: "700",
    color: colors.darkMainColor,
  },
  stats__label: {
    fontSize: 10,
    color: colors.darkGray,
    textAlign: "center",
    marginTop: 4,
  },

  // ==================== ТУЛТИП ====================
  tooltip: {
    position: "absolute",
    backgroundColor: colors.darkMainColor,
    borderRadius: 8,
    padding: 8,
    width: 80,
    zIndex: 999,
    elevation: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tooltip__date: {
    fontSize: 7,
    color: colors.lightGray,
    textAlign: "center",
    marginBottom: 2,
  },
  tooltip__count: {
    fontSize: 10,
    color: colors.white,
    textAlign: "center",
  },
  tooltip__arrow: {
    position: "absolute",
    bottom: -6,
    left: 34,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: "transparent",
    borderRightWidth: 6,
    borderRightColor: "transparent",
    borderTopWidth: 6,
    borderTopColor: colors.darkMainColor,
  },
});
