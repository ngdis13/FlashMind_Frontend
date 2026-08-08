import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ==================== БЛОК: productivityGraph ====================
  productivityGraph: {
    flexDirection: "column",
    paddingTop: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  productivityGraph__headerName: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  productivityGraph__infoIcon: {
    width: 16,
    height: 16,
    padding: 6,
  },

  // ==================== БЛОК: chart ====================
  chart: {
    flexDirection: "row",
    marginTop: 24,
    width: "100%",
    position: "relative",
    right: 7
  },

  // ===== Ось Y (5 делений: 100% → 0%) =====
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

  // ===== Сетка (5 горизонтальных линий) =====
  chart__gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },

  // ===== Область отрисовки столбиков =====
  chart__lines: {
    flex: 1,
    height: 200,
    position: "relative",
    marginBottom: 8,
  },

  // ===== Столбики =====
  chart__barsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  chart__barWrapper: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    paddingHorizontal: 4,
  },
  chart__bar: {
    width: "100%",
    maxWidth: 36,
    backgroundColor: colors.mainColor,
  },

  // ===== Ось X (подписи часовых диапазонов) =====
  chart__xAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingLeft: 53,
    paddingRight: 16,
  },
  chart__xAxisTextWrapper: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
});
