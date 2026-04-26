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
  },
  //Стили для информационных окон (например в создании карточки, в отображении карточек)
  //.
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DBDBDB",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    width: "100%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: "space-between",
  },
  mainHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
});
