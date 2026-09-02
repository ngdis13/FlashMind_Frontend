import { StyleSheet } from "react-native";
import { colors } from "@/styles/Colors";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Строго центрируем заголовок по горизонтали
    position: "relative",
    marginBottom: 16, // Немного увеличили отступ до карточки как на макете
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: 0, // Прижимаем к левому краю контейнера
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  boxActions: {
    position: "absolute",
    right: 0, // Прижимаем к правому краю контейнера
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Расстояние между глазком и карандашом
  },
  nameCard: {
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  boxPutOff: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
    paddingVertical: 8, // перекрывает padding: 12 у mainBox только по вертикали
  },
  boxInfo: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  metricsBox: {
    marginBottom: 16,
    gap: 12
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12, // зазор между рядами плиток
  },
  metricCard: {
    backgroundColor: colors.light2MainColor, // сиреневая плитка с макета
    borderRadius: 20,
    padding: 16,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metricIconBox: {
    width: 20,
    height: 20,
    alignItems: "center", 
    justifyContent: "center",
  },
  metricIcon: {
    width: "100%", 
    height: "100%",
  }
});
