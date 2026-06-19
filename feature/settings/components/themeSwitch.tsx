import { useState, useRef } from "react";
import sun from "@/feature-settings/assets/sun.png";
import moon from "@/feature-settings/assets/moon.png";
import {
  useColorScheme,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import Toast from "react-native-toast-message"; // Импортируем Toast

export default function ThemeSwitch() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const systemTheme = useColorScheme();

  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleTheme = () => {
    const nextValue = !isDarkMode;

    Animated.spring(slideAnim, {
      toValue: nextValue ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    setIsDarkMode(nextValue);

    Toast.show({
      type: "success",
      text1: nextValue ? "Включена тёмная тема" : "Включена светлая тема",
      position: "bottom",
      visibilityTime: 2000,
    });
  };

  const sliderPosition = slideAnim.interpolate({
    inputRange:[0,1],
    outputRange:[1,25],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleTheme}
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <Animated.View
        style={[
          styles.slider,
          isDarkMode && styles.darkSlider,
          {
            transform: [{ translateX: sliderPosition }],
            left: 4,
          },
        ]}
        pointerEvents="none" 
      >
        <Image
          source={isDarkMode ? moon : sun}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#EEEEEE",
    borderColor: "#DFDFDF",
    borderWidth: 2,
    borderRadius: 20,
    padding: 4,
    width: 60,
    height: 30,
    position: "relative",
  },
  darkContainer: {
    backgroundColor: "#B5B5B5",
    borderColor: "#999999",
    borderWidth: 2,
  },
  optionLeft: {
    flex: 1,
    height: "100%",
    zIndex: 1,
  },
  optionRight: {
    flex: 1,
    height: "100%",
    zIndex: 1,
  },
  icon: {
    width: 12,
    height: 12,
  },
  slider: {
    position: "absolute",
    width: 22,
    height: 22,
    backgroundColor: "#fff",
    borderRadius: 11,
    top: 2, 
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  darkSlider: {
    backgroundColor: "#808080",
  },
});
