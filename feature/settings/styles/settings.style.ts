import { colors } from "@/styles/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    buttonBox: {
        gap: 16,
    },
    exitButton: {
        borderColor: colors.errorColor
    },
    themeButton: {
        justifyContent: "space-between"
    }
})