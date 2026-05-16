import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Главный контейнер для скролла на весь экран
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 40,
  },
  
  // Кнопка назад
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    top: -8
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
    marginTop: "auto", // Прижимает кнопку к самому низу экрана, если контента мало
  }
});
