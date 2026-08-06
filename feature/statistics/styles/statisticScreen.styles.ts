import { colors } from "@/styles/Colors";
import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  infoIcon: {
    width: 16,
    height: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 116,
  },
  responsiveWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  changeDeckList: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    marginBottom: 20,
  },
  dropdownContainer: {
    flex: 1,
    position: "relative",
  },
  changeDeckBox: {
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.mainColor,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
  },
  changeButton: {
    borderRadius: 10,
    backgroundColor: colors.mainColor,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  imageChangeButton: {
    width: 25,
    height: 14,
    resizeMode: "contain",
  },
  // Стили для раскрывающегося контейнера
  dropdownList: {
    position: "absolute",
    top: 0, // Появляется ровно поверх основного инпута, маскируя его
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.mainColor,
    padding: 6,
    overflow: "hidden",
    // Тень для отделения выпадающего слоя от нижних карточек
    ...Platform.select({
      ios: {
        shadowColor: colors.mainColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dropdownItem: {
    padding: 8,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 8,
  },
  // Стиль для обычных пунктов (добавили рамку как на макете)
  dropdownItemInactive: {
    backgroundColor: "transparent",
    borderColor: colors.mainColor,
  },
  // Стиль для активного пункта
  dropdownItemActive: {
    backgroundColor: colors.mainColor,
    borderColor: colors.mainColor,
  },

  //----------------------------------------------
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Расталкивает две карточки по краям экрана
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  statCardContainer: {
    flex: 1,
    minWidth: 140,
    maxWidth: 182,
    height: 118,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },

  absoluteGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statCardBlur: {
    flex: 1,
    padding: 14,
    justifyContent: "flex-start",
    borderRadius: 28,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  cardIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 12,
  },

  /**График Активности */
  activityGraph: {
    flexDirection: "column",
  },
  activityGraph_header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  activityGraph_headerName: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  activityGraph_toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.light2MainColor,
    borderRadius: 14,
    padding: 4,
    position: "relative",
  },
  toggleSlider: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: 88,
    backgroundColor: colors.mainNumber,
    borderRadius: 12,
  },
  toggleButton: {
    width: 88,
    height: 33,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  chartOuterContainer: {
    flexDirection: "row",
    marginTop: 24,
    width: "100%",
    position: "relative",
  },
  yAxis: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingRight: 8,
    width: 35,
    borderRightWidth: 2,
    borderRightColor: colors.lightGray,
  },
  axisText: {
    fontSize: 10,
    color: colors.darkGray,
  },
  chartScrollContent: {
    paddingRight: 20,
    paddingBottom: 60,
  },
  chartBarsContainer: {
    flexDirection: "row",
    position: "relative",
    alignItems: "flex-end",
    paddingBottom: 2,
    paddingRight: 16,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },
  barColumnWrapper: {
    alignItems: "center",
    width: 24,
    marginHorizontal: 10, // Расстояние между колонками: 10+10 = 20px gap
    height: "100%",
    justifyContent: "flex-end",
  },
  barColumn: {
    width: 24,
    justifyContent: "flex-end",
    zIndex: 3,
    overflow: "hidden",
  },
  barSegment: {
    width: "100%",
  },
  xLabelWrapper: {
    position: "absolute",
    bottom: -55,
    width: 80,
    transform: [{ rotate: "70deg" }], // Поворот текста дат для экономии места
    alignItems: "flex-start",
  },
  xLabelText: {
    fontSize: 10,
    color: colors.darkGray,
  },

  tooltipContainer: {
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
  tooltipDate: {
    fontSize: 8,
    color: colors.lightGray,
  },
  tooltipTotal: {
    fontSize: 8,
    color: colors.white,
    fontWeight: "bold",
    marginVertical: 2,
  },
  tooltipSuccessText: {
    fontSize: 10,
    color: colors.white,
    textAlign: "center",
    marginVertical: 4,

  },
  tooltipMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metricDotBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotText: {
    fontSize: 9,
    color: colors.white,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -6,
    left: 62,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: "transparent",
    borderRightWidth: 6,
    borderRightColor: "transparent",
    borderTopWidth: 6,
    borderTopColor: colors.darkMainColor,
  },
  // ЛЕГЕНДА КАТЕГОРИЙ ПОД ГРАФИКОМ
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
  },
});
