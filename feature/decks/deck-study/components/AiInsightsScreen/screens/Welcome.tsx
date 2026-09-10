// --------------------------- React ---------------------------
import React, { useRef, useEffect } from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet, Image, Animated } from "react-native";

// --------------------------- Стили & Графика ---------------------------
import { Typography } from "@/styles/Typography";
import { AppEmojis } from "@/assets/emoji/emoji";
import { Logo } from "@/components/Logo";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";
import { useRouter } from "expo-router"; // или useNavigation из react-navigation

interface WelcomeProps {
  data: {
    analysis_date: string;
  };
  onNext: () => void;
}

export const Welcome = ({ data, onNext }: WelcomeProps) => {
  const router = useRouter();
  
  // Анимационные значения
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Анимация появления при монтировании
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formattedDate = new Date(data.analysis_date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });


  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ]
        }
      ]}
    >
      <View style={styles.characterWrapper}>
        <Logo size={240} />
      </View>
      
      <View style={styles.contentBlock}>
        <Typography variant="span" style={styles.mainTitle}>
          Твой отчет готов! <Image source={AppEmojis.rocket} style={styles.inlineEmoji} />
        </Typography>

        <Typography variant="span" style={styles.bodyText}>
          Мы собрали твои главные взлеты, нашли проблемные зоны и составили план на эту неделю
        </Typography>
      </View>

      {/* БЛОК С ДАТОЙ И КНОПКОЙ */}
      <View style={styles.bottomBlock}>
        <Typography variant="h3" style={styles.bottomDate}>
          Обновлено: {formattedDate}
        </Typography>
        
        <MainButton 
          title="Погнали!" 
          onPress={onNext} 
          style={styles.button} 
        />
      </View>
    </Animated.View>
  );
};

// --------------------------- Системные Стили (БЕЗ ИЗМЕНЕНИЙ) ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingBottom: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70
  },
  characterWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentBlock: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  mainTitle: {
    fontSize: 22,
    textAlign: "center",
  },
  bodyText: {
    lineHeight: 18,
    color: colors.darkGray,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  bottomBlock: {
    width: "100%",
    alignItems: "center",
    gap: 16, 
    marginTop: "auto", 
  },
  bottomDate: {
    color: colors.darkGray,
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    width: "100%",
  },
  inlineEmoji: {
    width: 20,
    height: 20,
  },
});