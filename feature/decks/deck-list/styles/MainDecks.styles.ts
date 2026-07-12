import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10, // Отступы 10px для всего контента разом
  },

  headerContainer: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
    marginTop: 20, 
    width: "100%",
  },
  
  listContentContainer: {
    paddingTop: 0,
    paddingBottom: 20,
    width: "100%",
    gap: 16,               
  },

  // Адаптивная сетка рядов
  columnWrapper: {
    gap: 9,                
    justifyContent: "flex-start",
    width: "100%",
  },
  deckItemWrapper: {
    flex: 1, 
    minWidth: 160, 
    maxWidth: 240, 
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
    width: "100%",
  },
  searchButton: {
    position: "absolute",
    marginRight: 12,
  },

  addDecksButton: {
    width: "100%",
    alignSelf: "center",  
    marginTop: "auto",    
    marginBottom: 80,     
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 135,
    width: "100%",
  },
  modalContent: {
    width: "95%",
    maxWidth: 400, 
    backgroundColor: colors.mainColor,
    paddingHorizontal: 12,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: "center",
  },
});
