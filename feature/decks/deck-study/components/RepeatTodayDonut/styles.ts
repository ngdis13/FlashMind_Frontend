import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 40, // расстояние между кругом и легендой
  },
  chartContainer: {
    position: "relative",
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  chartCenterText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  totalLabel: {
    color: colors.darkGray,
    textAlign: "center",
    marginTop: 2,
    fontSize: 10
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendText: {
    color: colors.darkMainColor,
  },
  boldText: {
    fontWeight: "700",
  },
});