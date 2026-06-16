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

  intensityBox: {
    gap: 8,
    width: "100%",
  },
  headerIntensity: {
    flexDirection: "row",
    gap: 8,
  },
  intensityButtonBox: {
    flexDirection: "row",
    justifyContent: "space-between", // Распределяет кнопки равномерно
    gap: 8, // Отступы между самими кнопками
    width: "100%",
  },
  intensityButton: {
    flex: 1, // Каждая кнопка займет равную долю пространства
    height: 40, // Высота кнопки под размер текста
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20, // Скругленные края как на макете
    borderWidth: 1,
    borderColor: "#E0E0E0", // Базовый цвет рамки неактивной кнопки
    backgroundColor: colors.white,
        borderWidth: 2,
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
  advancedSettingsBox: {
    width: "100%",
  },
  advancedSettings: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 20,

    backgroundColor: "#FFFFFF",
    width: "100%",
    gap: 16,
  },
  settings: {
    width: "100%",
  },
  sliderDescription: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 6,
    lineHeight: 18,
  },
  bottomButtonContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  deleteButton: {
    borderColor: colors.errorColor,
  },
  button: {
    width: "100%",
    marginTop: 0,
    alignSelf: "center",
  },
});
