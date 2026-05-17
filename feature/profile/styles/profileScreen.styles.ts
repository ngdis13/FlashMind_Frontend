import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Новые контейнеры для адаптивного выравнивания по центру экрана
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    
// Центрирует контент на веб-странице / планшете
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 116, // Отступ снизу с учетом вашей нижней панели
  },
  responsiveWrapper: {
    width: "100%",// На компьютерах приложение не расползется шире этой границы
    alignItems: "flex-start",
  },

  // Блок профиля
  bioBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    padding: 16,
  },
  aboutBox: {
    flex: 1, // Вместо фиксированных 230px теперь занимает все оставшееся место
    gap: 4,
  },
  nameBox: {
    flexDirection: "row",
    flexWrap: "wrap", // Если имя + фамилия слишком длинные, они перенесутся
    gap: 6,
  },

  // Блок активности общего назначения
  boxActivity: {
    width: "100%",
    gap: 8,
    marginBottom: 24,
  },
  boxProgress: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
  },

  // АДАПТИВНАЯ СЕТКА КАЛЕНДАРЯ
  boxProgress__nameRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayLabelWrapper: {
    width: `${100 / 7}%`, // Делим строку ровно на 7 равных частей
    alignItems: "center",
  },
  boxProgress__starsBox: {
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  boxProgress__line: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  starWrapper: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
  },


  boxProgress__boxLine: {
    backgroundColor: "#E0E0E0",
    height: 1,
    width: "100%",
    marginBottom: 16,
  },
  boxProgress__infoBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  boxProgress__infoBoxItem: {
    flex: 1, 
    alignItems: "center",
    gap: 4,
  },

  // Кнопка настроек
  settingsButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
});
