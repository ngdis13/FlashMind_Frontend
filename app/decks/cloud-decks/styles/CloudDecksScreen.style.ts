import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10, // 10px слева и справа
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  mainContent: {
    width: "100%",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    margin: -12,
  },
  privateLinkBox: {
    gap: 8,
  },
  privateLinkLine: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  privateLink: {
    flex: 1,
    textAlign: "left",
    borderColor: "#999EE4",
  },
  arrowButton: {
    width: 40,
    height: 40,
    backgroundColor: "#999EE4",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  searchHeader: {
    gap: 8,
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
  decksList: {
    paddingBottom: 20,
  },
  availableDecksSection: {
    width: "100%",
  },
});
