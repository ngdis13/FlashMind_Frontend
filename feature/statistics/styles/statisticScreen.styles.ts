import { colors } from "@/styles/Colors";
import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  infoIcon: {
    width: 16,
    height: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 116,
  },
  responsiveWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  changeDeckList: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    marginBottom: 20,
  },
  dropdownContainer: {
    flex: 1,
    position: "relative",
  },
  changeDeckBox: {
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.mainColor,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
  },
  changeButton: {
    borderRadius: 10,
    backgroundColor: colors.mainColor,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  imageChangeButton: {
    width: 25,
    height: 14,
    resizeMode: "contain",
  },
  // Стили для раскрывающегося контейнера
  dropdownList: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.mainColor,
    padding: 6,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.mainColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dropdownItem: {
    padding: 8,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 8,
  },
  dropdownItemInactive: {
    backgroundColor: "transparent",
    borderColor: colors.mainColor,
  },
  dropdownItemActive: {
    backgroundColor: colors.mainColor,
    borderColor: colors.mainColor,
  },

  //----------------------------------------------
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  statCardContainer: {
    flex: 1,
    minWidth: 140,
    maxWidth: 182,
    height: 118,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },

  absoluteGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statCardBlur: {
    flex: 1,
    padding: 14,
    justifyContent: "flex-start",
    borderRadius: 28,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  cardIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 12,
  },

  graphsBox: {
    gap: 16,
  },
  AiButton: {
    marginBottom: 16,
  },
  aiModalOverlay: {
    flex: 1,
    alignItems: "center",
  },
  aiModalContent: {
    width: "100%",
    maxWidth: 800,
    flex: 1,
  },
});
