import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: -20,
    padding: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
    width: "100%",
  },
  searchButton: {
    position: "absolute",
    marginRight: 12,
  },
  inlineEmoji: {
    width: 16,
    height: 16,
  },
  headerName: {
    marginBottom: 12
  },
  templateBox: {
    width: "100%",

  },
    createTemplateButton: {
    width: "100%", 
  },
  
});
