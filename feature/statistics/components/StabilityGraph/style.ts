import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ==================== БЛОК: stabilityGraph ====================
  stabilityGraph: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    position: "relative",
    borderRadius: 24, // Красивое скругление внешней карточки
  },
  stabilityGraph__headerName: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  stabilityGraph__infoIcon: {
    width: 16,
    height: 16,
  },

  // ==================== БЛОК: chart ====================
  chart: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 16
  },
  chart__yAxis: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200, 
    paddingRight: 12,
    width: 45,
    borderRightWidth: 2,
    borderRightColor: colors.lightGray,
    paddingBottom: 2, 
  },
  chart__axisText: {
    fontSize: 11,
    color: colors.darkGray,
  },
  chart__content: {
    flex: 1,
  },
  chart__lines: {
    height: 200, 
    position: "relative",
    borderBottomWidth: 2, 
    borderBottomColor: colors.lightGray,
  },
  chart__gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },

  // Столбцы
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
  chart__column: {
    alignItems: "center",
    width: "20%", 
    height: "100%",
    justifyContent: "flex-end",
  },
  chart__bar: {
    width: "100%",
    backgroundColor: colors.mainColor,
  },
  chart__barValue: {
    marginBottom: 6,
  },

  // Ось X
  chart__xAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    paddingLeft: 2, 
  },
  chart__xAxisText: {
    fontSize: 10,
    color: colors.darkGray,
    textAlign: "center",
    width: "22%",
  },

  // Нижний футер
  stabilityGraph__footer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
