
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  input: {
    width: "100%",
    textAlign: "left", // Отключаем центрирование
  },
  containerInput: {
    gap: 16,
    maxWidth: 400,
  },
  bioInput: {
    height: 100, // Высота для примерно 3 строк
    textAlign: "left", // Отключаем центрирование
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top", // Для Android
  },
  button: {
    position: "absolute",
    alignSelf: "center",
    bottom: 10,
    width: "95%"
  }
});
