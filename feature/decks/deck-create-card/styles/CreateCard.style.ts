import { StyleSheet } from "react-native";
import { colors } from "@/styles/Colors";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: -20,
    padding: 20,
  },
  viewCardButton: {
    position: "absolute",
    right: -20,
    padding: 20,
  },
  firstHeader: {
    textTransform: "uppercase",
    color: colors.darkGray,
    marginBottom: 8,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  underlineInput: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    borderBottomWidth: 2,
    borderBottomColor: "#DBDBDB",
    paddingVertical: 8,
    width: "100%",
  },
  createCardButton: {
    width: "100%",
  },
  titleBox: {
    width: "100%",
    marginBottom: 12,
    gap: 8,
  },
  checkboxContainer: {
    flexDirection: "row", // Ставит квадратик и текст в одну строку
    alignItems: "center", // Выравнивает их по центру по вертикали
    width: "100%",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.darkGray, // Серый цвет рамки для пустого квадратика
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: colors.mainColor, // Заливка твоим главным цветом при активации
    borderColor: colors.mainColor,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 14,
  },
  checkboxTextWrapper: {
    flex: 1, // Позволяет тексту занимать всю ширину и правильно переноситься
    marginLeft: 8, // Отступ между квадратиком и текстом
  },

  sideBox: {
    gap: 12,
    marginBottom: 16,
  },
  sideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoBox: {
    borderWidth: 0,
    gap: 8,
  },
  hintBox: {},
  hintHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  iconInfo: {
    width: 16,
    height: 16,
  },
  hintList: {
    gap: 8,
  },
  infoBoxContent: {
    width: "100%",
    justifyContent: "center",
  },
  // Стиль текста-заглушки, когда сторона пустая
  placeholderText: {
    color: colors.darkGray,
    fontStyle: "italic",
  },
  // Стиль уже введенного пользователем текста
  filledText: {
    color: colors.darkMainColor, // или твой основной цвет текста
  },
  blocksContainer: {
    width: "100%",
    gap: 8,
  },
  blockItem: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    padding: 8,
    borderRadius: 10,

  },
});
