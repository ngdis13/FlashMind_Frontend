// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet, Image, ScrollView } from "react-native";

// --------------------------- Библиотеки ---------------------------
import { LinearGradient } from "expo-linear-gradient";

// --------------------------- UI-Система Приложения ---------------------------
import { Typography } from "@/styles/Typography";
import { AppEmojis } from "@/assets/emoji/emoji";
import { LogoSurprisedStar } from "@/components/LogoSurprised";
import { MainButton } from "@/components/MainButton";

// --------------------------- Типизация Props ---------------------------
interface RecommendationItem {
  title: string;
  text: string;
}

interface RecommendationProps {
  data: {
    recommendations: RecommendationItem[];
  };
  onNext: () => void;
}

export const Recommendation = ({ data, onNext }: RecommendationProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <LogoSurprisedStar size={180} style={{ alignSelf: "center" }} />
        </View>

        {/* Список карточек */}
        <View style={styles.listContainer}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Рекомендации
          </Typography>
          {data.recommendations.map((item, index) => {
            return (
              <LinearGradient
                key={index}
                colors={[
                  "rgba(255, 207, 15, 0.42)",
                  "rgba(255, 241, 184, 0.24)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.listItemGradient}
              >
                <View style={styles.emojiWrapper}>
                  <Image
                    source={AppEmojis.lightbulb}
                    style={styles.inlineEmoji}
                  />
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
            );
          })}
        </View>

        </ScrollView>
      <View style={styles.buttonWrap}>
          <MainButton title="Далее" onPress={onNext} style={styles.button} />
        </View>
    </View>
  );
};

// --------------------------- Системные Стили ---------------------------
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
    shadowColor: "#D29D4A",
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
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    shadowColor: "#000000",
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
    color: "#D29D4A",
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
