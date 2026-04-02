import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  mainInfo: {
    gap: 16,
    marginBottom: 16,
  },
  settingsButton: {
    flexDirection: "row",
    gap: 8,
    maxWidth: "100%"
  },
  cardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
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
  },
  cardBox: {

  },
  cardList: {
    flex: 1
  }
});
