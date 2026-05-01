import { StyleSheet } from "react-native";
import { colors } from "@/styles/Colors";
export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  firstHeader: {
    textTransform: "uppercase",
    color: colors.darkGray,
    marginBottom: 8,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 32
  },
   underlineInput: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    borderBottomWidth: 2,      // Толщина линии
    borderBottomColor: '#DBDBDB', // Цвет линии
    paddingVertical: 8,        // Отступы внутри инпута
  },
  createCardButton: {
    
  }
});
