import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ==================== БЛОК: difficultyCardsGraph ====================
  difficultyCardsGraph: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    position: "relative",
  },
  difficultyCardsGraph__headerName: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  difficultyCardsGraph__infoIcon: {
    width: 16,
    height: 16,
    padding: 6,
  },
  difficultyCardsGraph__footer: {
    alignItems: "center",
    width: "100%",
  },


  // ==================== БЛОК: chart ====================
  chart: {
    flexDirection: "row",
    width: "100%",
    position: "relative",
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
  chart__lines: {
    flex: 1,
    height: 200,
    position: "relative",
  },
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
    paddingBottom: 1,
  },
  chart__barWrapper: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  chart__bar: {
    width: "75%",
  },
  chart__xAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingLeft: 53,
    paddingRight: 8,
    marginTop: 8,
    width: "100%",
    marginBottom: 16
  },
  chart__xLabelWrapper: {
    flex: 1,
    alignItems: "center",
  },
});
