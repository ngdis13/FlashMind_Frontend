import React from "react";
import { Typography } from "@/styles/Typography";
import { Pressable, View, StyleSheet } from "react-native";
import { colors } from "@/styles/Colors";

export const RatingButton = React.memo(({ label, colorStyle, onPress, disabled }: any) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      {({ pressed }) => (
        <View style={[styles.ratingButton, colorStyle]}>
          {/* Слой затемнения */}
          {pressed && (
            <View 
              style={[
                StyleSheet.absoluteFill, 
                { backgroundColor: "rgba(0, 0, 0, 0.15)" }
              ]} 
            />
          )}
          
          <Typography variant="h3" color={colors.darkColor}>
            {label}
          </Typography>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    // Убираем лишние стили отсюда, переносим в View
  },
  ratingButton: {
    width: 86,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden", // Чтобы затемнение не вылезало за края
  },
});
