import { StyleSheet } from "react-native";
import { colors } from "@/styles/Colors"; // ИСПРАВЛЕНИЕ: Импортируем палитру цветов

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center", // ИСПРАВЛЕНО: Центрирует шапку и инпуты по горизонтали на ПК
    paddingHorizontal: 10,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 4,
  },
  infoBox: {
    gap: 16,
    width: "100%",
    marginBottom: 32,
  },
  input: {
    height: 54, 
    textAlign: "left",
    paddingHorizontal: 16, 
  },
  descriptionInput: {
    minHeight: 90, 
    height: "auto", 
    paddingTop: 14, 
    textAlignVertical: "top", 
  },
  colorPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    paddingHorizontal: 16,
    gap: 12,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF8E8E", 
  },
  colorText: {
    fontSize: 16,
  },
  bottomButtonContainer: {
    width: "100%",
    paddingHorizontal: 10, 
    paddingBottom: 20, 
    backgroundColor: colors.background, 
  },
  button: {
    width: "100%",
    marginTop: 0,
    alignSelf: "center",
  },
});
