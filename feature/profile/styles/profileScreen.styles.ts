import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 116,
  },
  responsiveWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  bioBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    padding: 16,
  },
  // Стили для кнопки аватара и лоадера внутри круга
  avatarButton: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden", // Чтобы затемнение лоадера не вылезало за края круга
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarLoaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.4)", // Полупрозрачный черный фон поверх аватарки
    justifyContent: "center",
    alignItems: "center",
  },
  aboutBox: {
    flex: 1,
    gap: 4,
  },
  nameBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  // Стили для контейнера сообщений об ошибках
  errorContainer: {
    position: "absolute",
    zIndex: 9999,
    elevation: 999,
    bottom: 20,
    width: "100%",
    backgroundColor: colors.errorColor, 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderColor: colors.mainColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  errorText: {
    color: colors.white,
    textAlign: "center",
  },
  boxActivity: {
    width: "100%",
    gap: 8,
    marginBottom: 24,
  },
  boxProgress: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
  },
  boxProgress__nameRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayLabelWrapper: {
    width: `${100 / 7}%`,
    alignItems: "center",
  },
  boxProgress__starsBox: {
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  boxProgress__line: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  starWrapper: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  boxProgress__boxLine: {
    backgroundColor: "#E0E0E0",
    height: 1,
    width: "100%",
    marginBottom: 16,
  },
  boxProgress__infoBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  boxProgress__infoBoxItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  settingsButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
});
