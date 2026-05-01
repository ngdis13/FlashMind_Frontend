import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16
  },
  counter: {
    alignItems: "center",
    maxWidth: 370,
    marginBottom: 12
  },
  buttonBox: {
    flexDirection:"row",
    gap: 10,
    justifyContent: "center"
  },
  ratingButton: {
    width: 86,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
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

});
