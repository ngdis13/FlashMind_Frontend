import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  searchButton: {
    position: "absolute",
    marginRight: 12,
  },
  addDecksButton: {
    alignSelf: "center",
    maxWidth: 373,
    marginBottom: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Затемнение
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 135,
  },
  modalContent: {
    width: "95%",
    backgroundColor: colors.mainColor, // Фиолетовый фон
    paddingHorizontal: 12,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: "center",
  },
});
