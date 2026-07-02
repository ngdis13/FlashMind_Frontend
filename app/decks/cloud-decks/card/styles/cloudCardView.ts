// app/decks/cloud-decks/styles/cloudCardView.style.ts
import { StyleSheet } from "react-native";
import { colors } from "@/styles/Colors";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    gap: 4
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 24,
  },
  firstHeader: {
    color: colors.darkGray,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  valueContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    paddingBottom: 8,
    minHeight: 40,
  },

});