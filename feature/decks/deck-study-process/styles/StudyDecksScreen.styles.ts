import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
    width: "100%", 
  },
  counter: {
    alignItems: "center",
    width: "100%", 
    marginBottom: 12,
  },
  buttonBox: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    maxWidth: 500, 
    alignSelf: "center",
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
    backgroundColor: "rgba(0, 0, 0, 0.15)", 
  },
});
