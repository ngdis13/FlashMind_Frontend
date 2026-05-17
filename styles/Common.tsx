import { StyleSheet } from "react-native";
import { colors } from "./Colors";

// Константа ограничения ширины для ПК и планшетов
const MAX_CONTENT_WIDTH = 800;

export const commonStyles = StyleSheet.create({
  // Главный экран приложения. На ПК он займет 100%, но отцентрирует всё содержимое
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center", // Центрирует дочерние элементы по горизонтали
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    marginHorizontal: "auto", 
  },

  // Центральный блок контента. Теперь он не растянется шире 600px
  content: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH, // Ограничение для ПК
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  // Основной контент (например, списки или формы) — тоже ограничиваем
  mainContent: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH, // Ограничение для ПК
    justifyContent: "center",
    paddingHorizontal: 10,
    marginTop: 30,
  },

  // Кнопка на абсолютном позиционировании теперь корректно центрируется и не растягивается на весь ПК
  buttonContainer: {
    position: "absolute",
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH, // Кнопка сжимается до размеров контента
    bottom: 30,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  // Карточки, инфо-боксы и шапки будут занимать 100% от родителя (то есть от макс. 600px)
  mainBox: {
    width: "100%", 
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 2,
    padding: 12,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 8,
  },

  mainHeader: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DBDBDB",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: "space-between",
  },

  greyButton: {
    flexDirection: "row",
    gap: 8,
  },

  tabIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 45,
    height: 45,
    backgroundColor: "#F1F1F1",
    borderRadius: 12,
  },
});
