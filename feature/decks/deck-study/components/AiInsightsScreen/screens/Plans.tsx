// --------------------------- React ---------------------------
import React, { useRef, useEffect } from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet, Image, ScrollView, Animated } from "react-native";

// --------------------------- Библиотеки ---------------------------
import { LinearGradient } from "expo-linear-gradient";

// --------------------------- UI-Система Приложения ---------------------------
import { Typography } from "@/styles/Typography";
import { AppEmojis } from "@/assets/emoji/emoji";
import { LogoCuteStar } from "@/components/LogoCuteStar";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";

// --------------------------- Типизация Props ---------------------------
interface GoalItem {
  title: string;
  text: string;
}

interface PlansProps {
  data: {
    goals: GoalItem[];
  };
  onNext: () => void;
}

export const Plans = ({ data, onNext }: PlansProps) => {
  // Анимация для всего контента (появление после свайпа)
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  
  // Анимация для звездочки
  const starScale = useRef(new Animated.Value(0.5)).current;
  
  // Анимации для каждой карточки
  const cardAnimations = useRef(
    data.goals.map(() => ({
      fade: new Animated.Value(0),
      translateY: new Animated.Value(40),
    }))
  ).current;

  useEffect(() => {
    // 1. Анимация появления всего контента
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Анимация звездочки (с задержкой)
    setTimeout(() => {
      Animated.spring(starScale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 200);

    // 3. Анимация карточек (каскадом)
    cardAnimations.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 1,
          duration: 500,
          delay: 400 + index * 120,
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          delay: 400 + index * 120,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: contentFade,
          transform: [{ translateY: contentTranslateY }],
        }
      ]}
    >
      <ScrollView
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={{
            transform: [{ scale: starScale }],
          }}
        >
          <LogoCuteStar size={180} style={{ alignSelf: "center" }} />
        </Animated.View>

        {/* Список карточек */}
        <View style={styles.listContainer}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Цели на неделю
          </Typography>
          {data.goals.map((item, index) => {
            const anim = cardAnimations[index];
            return (
              <Animated.View
                key={index}
                style={{
                  opacity: anim.fade,
                  transform: [{ translateY: anim.translateY }],
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(110, 117, 217, 0.30)",
                    "rgba(215, 218, 255, 0.24)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.listItemGradient}
                >
                  <View style={styles.emojiWrapper}>
                    <Image source={AppEmojis.target} style={styles.inlineEmoji} />
                  </View>

                  <View style={styles.cardContent}>
                    <Typography variant="h3" style={styles.cardTitle}>
                      {item.title}
                    </Typography>
                    <Typography variant="h3" style={styles.cardBody}>
                      {item.text}
                    </Typography>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonWrap}>
        <MainButton title="Далее" onPress={onNext} style={styles.button} />
      </View>
    </Animated.View>
  );
};

// --------------------------- Системные Стили (НЕ ИЗМЕНЕНЫ) ---------------------------
const styles = StyleSheet.create({
  container: {
    maxWidth: 800,
    height: "100%",
    paddingHorizontal: 12,
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  listContainer: {
    width: "100%",
    gap: 8,
  },
  listItemGradient: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    shadowColor: colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  emojiWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    shadowColor: colors.mainColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inlineEmoji: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.mainColor,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 15,
  },
  buttonWrap: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    paddingHorizontal: 12,
  },
  button: {
    width: "100%",
  },
});