import { StyleSheet } from "react-native";
import { colors } from "./Colors";

export const commonStyles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    width: "100%",
    bottom: 30,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {

    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  mainContent: {
    justifyContent: "center",
    paddingHorizontal: 10,
    marginTop: 30,
  },
  mainBox: {
    maxWidth: 373,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 2,
    padding: 12,
    alignItems: "center"
  },

  greyButton: {
    /**для кнопок как в настройках */
    flexDirection: "row",
    gap: 8,
  },

  /**Квадратики для таб бара */
  tabIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 45,
    height: 45,
    backgroundColor: "#F1F1F1",
    borderRadius: 12,

  }
});
