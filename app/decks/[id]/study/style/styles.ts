import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  mainContent: {
    gap: 24,
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
    zIndex: 10, // Чтобы тултип был поверх других элементов
  },
  counter: {
    flexDirection: "row",
    gap: 11,
  },
  startButton: {
    maxWidth: 373,
    marginLeft: 10,
    
  },
  tooltip: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#E2E4FF",
    padding: 12,
    borderRadius: 20,
     maxWidth: 373, // Чтобы растягивался по ширине контента
    marginTop: -30, // Ключевой момент: "наезжает" на белый блок на 10 пикселей
    zIndex: 2, // Чтобы быть поверх тени/границы блока

    // Тени оставляем
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
