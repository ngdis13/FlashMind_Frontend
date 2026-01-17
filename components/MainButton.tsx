import React from "react"
import { TouchableOpacity, Text, StyleSheet, ViewStyle  } from "react-native"

interface ButtonProps {
  title: string
  style?: ViewStyle | ViewStyle[],
  onPress: () => void
}

export const MainButton = ({ title, onPress }: ButtonProps) => (
  <TouchableOpacity style={styles.btn} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#6E75D9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    height: 46,
    maxWidth: 400,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "MontserratSemibold",
    fontWeight: "400",
  },
})
