import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  counter: {
    alignItems: "center",
    maxWidth: 370,
    marginBottom: 12,
  },
  buttonBox: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },

  redButton: {
    backgroundColor: colors.ratingRed,
  },
  yellowButton: {
    backgroundColor: colors.ratingYellow,
  },
  lightGreenButton: {
    backgroundColor: colors.ratingLightGreen,
  },
  darkGreenButton: {
    backgroundColor: colors.ratingDarkGreen,
  },
  darkenOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.15)", // Универсальный способ затемнить
  },
});
