import { BOTTOM_MARGIN } from "@/styles/Common";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 40,
  },

  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },

  containerInput: {
    gap: 16,
    width: "100%",
    marginBottom: 32,
  },

  input: {
    width: "100%",
    textAlign: "left",
  },

  bioInput: {
    height: 100,
    textAlign: "left",
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },

  // Кнопка адаптивно растягивается по ширине экрана с небольшими отступами
  button: {
    width: "100%",
    marginTop: "auto",
    marginBottom: BOTTOM_MARGIN,
    paddingHorizontal: 10,
  },
});
