import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8
  },
  headerName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
  // Карточка колоды с mainBox
  deckCard: {
    marginBottom: 16,
    padding: 0, // Убираем внутренний отступ mainBox, чтобы управлять им самим
    overflow: "hidden", // Чтобы содержимое не выходило за скругленные углы
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
  
  authorSection: {
    width: "100%",
  },
  authorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    width: "100%",
  },
});