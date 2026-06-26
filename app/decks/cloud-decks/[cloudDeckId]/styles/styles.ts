import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  headerName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Карточка колоды с mainBox
  deckCard: {
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
  },
  deckCardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "stretch",
  },
  purpleLine: {
    width: 4,
    backgroundColor: colors.mainColor,
    borderRadius: 2,
    marginRight: 12,
  },
  deckInfo: {
    flex: 1,
    gap: 6,
  },
  deckTitle: {
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 24,
  },
  deckDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.darkGray,
  },
  deckMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
  },
  downloadBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // Секция "Об авторе"
  authorSection: {
    width: "100%",
    paddingBottom: 16,
  },
  authorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },
  authorBio: {
    flexDirection: "row",
    gap: 12,
  },
  authorBioBox: {
    flex: 1,
    gap: 4,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: "cover",
  },

  // Секция карточек
  cardsSection: {
    width: "100%",
  },
  cardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },
  
  // Поиск
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    position: "relative",
  },
  searchButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -9 }],
  },
  
  cardsList: {
    width: "100%",
  },
  cardItem: {
    minHeight: 40,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  cardText: {
    fontSize: 15,
    flex: 1,
  },
  cardArrow: {
    marginLeft: 12,
  },
  

  emptyDeck: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    width: "100%",
  },
});