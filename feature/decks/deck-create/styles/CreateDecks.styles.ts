import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputBox: {
    gap: 16,
    marginBottom: 16
  },
  createDecksButton: {
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  infoBox: {
    alignItems: "center",
  },
  colorBox: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  colorEllipse: {
    width: 20,
    height: 20,
    borderRadius: 80
  }
});
