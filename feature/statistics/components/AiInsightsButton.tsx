import React from "react";
import { Pressable, View, Image, StyleSheet } from "react-native";
import { Typography } from "@/styles/Typography";
import IconSparkles from "@/assets/icons/IconSparkles.png";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/styles/Colors";
import { MotiView } from "moti";

interface AiInsightsButtonProps {
  onPress: () => void;
  isLoading: boolean; // Передавайте true, пока идет генерация анализа
}

export default function AiInsightsButton({
  onPress,
  isLoading,
}: AiInsightsButtonProps) {
  return (
    // Заменили анимацию масштаба на статичный контейнер, кнопка больше не расширяется
    <View style={styles.buttonWrapper}>
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.pressableArea,
          pressed && !isLoading && styles.buttonPressed,
        ]}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.03)"]}
          start={[0, 0]}
          end={[0, 1]}
          locations={[0.02, 1.0]}
          style={styles.strokeGradient}
        >
          <LinearGradient
            colors={["#C55BE6", "#9A64BB", "#5548CE"]}
            locations={[0, 0.53, 1.0]}
            start={[0, 0.2]}
            end={[1, 0.8]}
            style={styles.gradientBg}
          >
            {/* АНИМАЦИОННЫЙ КОНТЕЙНЕР ОРБИТЫ */}
            <MotiView
              animate={{
                rotate: isLoading ? "360deg" : "0deg",
                scale: isLoading ? [1, 1.1, 0.95, 1] : 1,
              }}
              transition={{
                type: "timing",
                duration: 2000, // Скорость плавного кружения
                loop: isLoading,
              }}
              style={styles.iconBox}
            >
              <MotiView
                animate={{
                  scale: isLoading ? [1, 1.15, 0.9, 1] : 1,
                }}
                transition={{
                  type: "timing",
                  duration: 2000,
                  loop: isLoading,
                }}
                style={styles.innerIconWrapper}
              >
                <Image
                  source={IconSparkles}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </MotiView>
            </MotiView>

            {/* КОНТЕЙНЕР ДЛЯ ПЛАВНОЙ СМЕНЫ ТЕКСТА */}
            <View style={styles.textContainer}>
              
              {/* ТЕСТ 1: "Ai Инсайты" (Плавное затухание при загрузке) */}
              <MotiView
                animate={{
                  opacity: isLoading ? 0 : 1,
                  scale: isLoading ? 0.95 : 1,
                }}
                transition={{
                  type: "timing",
                  duration: 300,
                }}
                style={StyleSheet.absoluteFill}
              >
                <Typography
                  variant="h2"
                  color={colors.white}
                  style={styles.btnText}
                >
                  Ai Инсайты
                </Typography>
              </MotiView>

              {/* ТЕКСТ 2: "ИИ думает..." (Плавное проявление при загрузке) */}
              <MotiView
                animate={{
                  opacity: isLoading ? 1 : 0,
                  scale: isLoading ? 1 : 0.95,
                }}
                transition={{
                  type: "timing",
                  duration: 400,
                }}
                style={StyleSheet.absoluteFill}
              >
                <Typography
                  variant="h2"
                  color={colors.white}
                  style={styles.btnText}
                >
                  ИИ думает...
                </Typography>
              </MotiView>

            </View>

          </LinearGradient>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    width: "100%",
    height: 40,
    borderRadius: 15,
    backgroundColor: "transparent",
    shadowColor: "#9353DB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  pressableArea: {
    flex: 1,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  strokeGradient: {
    flex: 1,
    borderRadius: 15,
    padding: 0.5,
  },
  gradientBg: {
    flex: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  iconBox: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  innerIconWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 35,
    height: 35,
    top: 2,
  },
  textContainer: {
    position: "absolute",
    left: 48,
    right: 48,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    letterSpacing: 0.3,
    textAlign: "center",
    width: "100%",
    lineHeight: 38,
  },
});
