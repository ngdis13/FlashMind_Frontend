import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  nameBox: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  aboutBox: {
    gap: 4,
    marginTop: 6,
    width: 230
  },
  bioBox: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  boxActivity: {
    gap: 8,
    marginBottom: 24,
  },
  boxProgress: {
    marginTop: 12,
    alignItems: "center",
  },
  boxProgress__name: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 8,
  },
  boxProgress__starsBox: {
    gap: 8,
    marginBottom: 16,
  },
  boxProgress__line: {
    flexDirection: "row",
    gap: 22,
  },
  boxProgress__boxLine: {
    backgroundColor: "#BFBFBF",
    height: 2,
    width: "90%",
    marginBottom: 8,
  },
  boxProgress__infoBox: {
    flexDirection: "row",
    marginBottom: 12,
  },
  boxProgress__infoBoxItem: {
    width: "32%",
    alignItems: "center",
    gap: 8,
  },
  settingsButton: {
    flexDirection: "row",
    gap: 8,
  },
});
