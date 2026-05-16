import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
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

  // Базовые настройки текста внутри инпутов (рамки и фоны придут из mainBox)
  input: {
    height: 54, // Высота плашки, как у вас в Фигме
    textAlign: "left",
    paddingHorizontal: 16, // Внутренний отступ для текста
  },

  // Особые настройки для многострочного текстового поля
  descriptionInput: {
    minHeight: 90, // Делаем плашку описания повыше
    height: "auto", // Позволяет полю расти, если текста много
    paddingTop: 14, // Аккуратный отступ сверху, чтобы текст не прилипал к верхней рамке
    textAlignVertical: "top", // Фикс для Android, чтобы текст начинался сверху
  },

  // Кнопка выбора цвета
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
    backgroundColor: "#FF8E8E", // Розовый цвет кружка
  },
  colorText: {
    fontSize: 16,
  },
  bottomButtonContainer: {
    width: "100%",
    paddingHorizontal: 10, // Отступы по 10 пикселей слева и справа, как у карточек
    paddingBottom: 20, // Идеальный отступ от самого низа экрана до кнопки
    backgroundColor: "#F8F9FA", // Поставьте цвет фона вашего экрана (colors.background)
  },

  button: {
    width: "100%",
    marginTop: 0,
  },
});
