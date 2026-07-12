import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 16, // Немного увеличили зазор для лучшей читаемости
    alignItems: "center",
    width: "100%", // Гарантируем, что шапка занимает всю ширину контейнера
  },
  headerTitle: {
    flex: 1, // Текст забирает всё свободное пространство и не выталкивает стрелку
    flexWrap: "wrap", // Перенос строго по словам, а не по буквам
  },
  mainContent: {
    gap: 24,
    width: "100%", // Чтобы контент не сжимался
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingEnd: 30,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 10,
  },
  infoBox: {
    minWidth: 370,
    alignSelf: "center"
  },
  counter: {
    flexDirection: "row",
    gap: 11,
    alignItems: "center", // Выравниваем плюс/минус и цифру по вертикали
  },
  startButton: {
    width: "100%", // Теперь кнопка растянется ровно по ширине контента (до 800px)
    paddingHorizontal: 10,
  },
  tooltip: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#E2E4FF",
    padding: 12,
    borderRadius: 20,
    width: "100%", // Растягиваем подсказку на всю ширину карточки
    marginTop: -16, // Корректируем наезд на блок с учетом отступов
    zIndex: 2,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
