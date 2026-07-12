import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  noticeBox: {
    position: "relative", // Контейнер становится опорной точкой для абсолютного элемента
    alignItems: "center",
    justifyContent: "center",
    width: 24,            // Задаем ширину строго по размеру кнопки импорта
    height: 24,
  },
  headerName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  importButton: {
    width: 24,
    height: 24,
  },
  cloudAlertAbsoluteLeft: {
    position: "absolute",
    left: -32, // Сдвигаем уведомление влево ровно на 32 пикселя от импорта
    width: 24,
    height: 24,
  },
  mainInfo: {
    gap: 16,
    marginBottom: 16,
    width: "100%",
  },
  info: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  purpleLine: {
    width: 4,
    backgroundColor: colors.mainColor,
    borderRadius: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  settingsButton: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  cards: {
    width: "100%", // ИСПРАВЛЕНО: Растягиваем блок карточек на 100% от родителя
  },
  cardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    width: "100%",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
    width: "100%",
  },
  searchButton: {
    position: "absolute",
    marginRight: 12,
  },
  addDecksButton: {
    alignSelf: "center",
    maxWidth: 373,
  },
  emptyDeck: {
    alignItems: "center",
    width: "100%",
  },
  cardBox: {
    width: "100%",
  },
  cardList: {
    flex: 1,
    width: "100%",
  },
});
