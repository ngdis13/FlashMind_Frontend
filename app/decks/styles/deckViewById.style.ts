import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  mainInfo: {
    gap: 16,
    marginBottom: 16,
    width: "100%", // ИСПРАВЛЕНО: Растягивается до краев адаптивного контейнера
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
