import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const activityGraphStyles = StyleSheet.create({
  // ==================== БЛОК: activityGraph ====================
  activityGraph: {
    flexDirection: "column",
  },
  activityGraph__header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  activityGraph__headerName: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  activityGraph__infoIcon: {
    width: 16,
    height: 16,
  },

  // ===== Переключатель toggle =====
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
    marginTop: 24,
    width: "100%",
    position: "relative",
    marginBottom: 16,
  },
  chart__yAxis: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingRight: 8,
    width: 35,
    borderRightWidth: 2,
    borderRightColor: colors.lightGray,
  },
  chart__axisText: {
    fontSize: 10,
    color: colors.darkGray,
  },
  chart__gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },

  // ===== Столбчатый график =====
  chart__scrollContent: {
    paddingRight: 20,
    paddingBottom: 60,
  },
  chart__bars: {
    flexDirection: "row",
    position: "relative",
    alignItems: "flex-end",
    paddingBottom: 2,
    paddingRight: 16,
  },
  chart__barWrapper: {
    alignItems: "center",
    width: 24,
    marginHorizontal: 10,
    height: "100%",
    justifyContent: "flex-end",
  },
  chart__bar: {
    width: 24,
    justifyContent: "flex-end",
    zIndex: 3,
    overflow: "hidden",
  },
  chart__barSegment: {
    width: "100%",
  },
  chart__xLabel: {
    position: "absolute",
    bottom: -55,
    width: 80,
    transform: [{ rotate: "70deg" }],
    alignItems: "flex-start",
  },
  chart__xLabelText: {
    fontSize: 10,
    color: colors.darkGray,
  },

  // ===== Линейный график =====
  chart__lines: {
    flex: 1,
    height: 200,
    position: "relative",
  },
  chart__totalText: {
    textAlign: "center",
    color: colors.darkMainColor,
  },

  // ==================== БЛОК: tooltip ====================
  tooltip: {
    position: "absolute",
    backgroundColor: colors.darkMainColor,
    borderRadius: 8,
    padding: 8,
    width: 170,
    zIndex: 999,
    elevation: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tooltip__date: {
    fontSize: 8,
    color: colors.lightGray,
  },
  tooltip__total: {
    fontSize: 8,
    color: colors.white,
    fontWeight: "bold",
    marginVertical: 2,
  },
  tooltip__success: {
    fontSize: 10,
    color: colors.white,
    textAlign: "center",
    marginVertical: 4,
  },
  tooltip__metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tooltip__metricDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tooltip__dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tooltip__dotText: {
    fontSize: 9,
    color: colors.white,
  },
  tooltip__arrow: {
    position: "absolute",
    bottom: -6,
    left: 79,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: "transparent",
    borderRightWidth: 6,
    borderRightColor: "transparent",
    borderTopWidth: 6,
    borderTopColor: colors.darkMainColor,
  },

  // ==================== БЛОК: legend ====================
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  legend__item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legend__dot: {
    width: 12,
    height: 12,
    borderRadius: 12,
  },
});
