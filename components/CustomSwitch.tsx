// feature-decks/deck-create-card/components/CustomSwitch.tsx
import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { colors } from "@/styles/Colors";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
}) => {
  // Анимированное значение прогресса: 0 (выключен) или 1 (включен)
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    // Плавный перекат без пружинного отскока
    progress.value = withTiming(value ? 1 : 0, { duration: 250 });
  }, [value, progress]);

  // Анимация изменения цвета фона плашки switch
  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1], // Входной диапазон (0 — выключен, 1 — включен)
      [colors.lightMainColor, colors.mainColor] // Перетекание цветов с макета
    );
    return { backgroundColor };
  });

  // Анимация перекатывания кружочка
  const animatedCircleStyle = useAnimatedStyle(() => {
    // Смещение кружка: 0 — крайнее левое положение, 20 — крайнее правое
    return {
      transform: [{ translateX: progress.value * 30 }],
    };
  });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Animated.View style={[styles.circle, animatedCircleStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    borderRadius: 20,
    padding: 3,
    justifyContent: "center",
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    // Мягкая нативная тень для объема кружочка
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 2,
  },
});
