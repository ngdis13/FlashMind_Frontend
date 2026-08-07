import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ==================== БЛОК: cardsStatusGraph ====================
  cardsStatusGraph: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 12,
    paddingTop: 16,
    position: "relative",
  },
  cardsStatusGraph__header: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  cardsStatusGraph__infoIcon: {
    width: 16,
    height: 16,
  },
  // ==================== ОБЛАСТЬ КОНТЕНТА ====================
  cardsStatusGraph__content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Прижимает график влево, а отступ регулируется через gap/padding
    width: "100%",
    paddingTop: 10, // Небольшой отступ сверху, чтобы контент не прилипал к кнопке инфо
  },

  // ==================== ГРАФИК (ПОНЧИК) ====================
  chartContainer: {
    position: "relative",
    width: 120, // Изменили на 120, чтобы строго соответствовать размеру SVG
    height: 120, // Изменили на 120
    justifyContent: "center",
    alignItems: "center",
  },
  chartCenterText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  totalCountText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkMainColor,
  },
  totalLabelText: {
    fontSize: 10,
    color: colors.darkGray,
    marginTop: 2, // Добавили, чтобы текст не слипался с цифрой
    textAlign: "center",
  },

  // ==================== ЛЕГЕНДА (СПИСОК СТАТУСОВ) ====================
  legendContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10, // Немного увеличили расстояние между строками под дизайн
    paddingLeft: 24, // Увеличили отступ от кольца до текста
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendMarker: {
    width: 10, // Слегка увеличили маркеры для лучшей видимости
    height: 10,
    borderRadius: 5, // Идеальный круг
    marginRight: 12,
  },
  legendText: {
    fontSize: 13,
    color: colors.darkMainColor,
    lineHeight: 16, // Добавили базовый хайт для аккуратного выравнивания с маркером
  },
  boldText: {
    fontWeight: "700",
  },
});
