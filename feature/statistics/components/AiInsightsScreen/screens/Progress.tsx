// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet, Image, Dimensions, ScrollView } from "react-native";

// --------------------------- Библиотеки ---------------------------
import { LinearGradient } from "expo-linear-gradient";

// --------------------------- UI-Система Приложения ---------------------------
import { Typography } from "@/styles/Typography";
import { AppEmojis } from "@/assets/emoji/emoji";
import { LogoHappyStar } from "@/components/LogoHappyStar";
import { MainButton } from "@/components/MainButton";

// --------------------------- Типизация Props ---------------------------
interface InsightItem {
  title: string;
  text: string;
}

interface ProgressProps {
  data: {
    insights: InsightItem[];
  };
  onNext: () => void;
}

export const Progress = ({ data, onNext }: ProgressProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <LogoHappyStar size={180} style={{ alignSelf: "center" }} />
        </View>

        {/* Список карточек */}
        <View style={styles.listContainer}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Что круто?
          </Typography>
          {data.insights.map((item, index) => {
            return (
              <LinearGradient
                key={index}
                colors={[
                  "rgba(137, 197, 121, 0.48)",
                  "rgba(188, 255, 170, 0.24)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.listItemGradient}
              >
                {/* Универсальный белый выразительный бэдж-круг */}
                <View style={styles.emojiWrapper}>
                  <Image source={AppEmojis.rocket} style={styles.inlineEmoji} />
                </View>

                {/* Текстовое наполнение карточки */}
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

// --------------------------- Системные Премиум-Стили ---------------------------
const styles = StyleSheet.create({
  container: {
    maxWidth: 800,
    height: "100%",
    paddingHorizontal: 12,
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: 16, // Большой отступ сверху, чтобы текст не заезжал под центральную печеньку из index.tsx!
    paddingBottom: 110, // Отступ снизу, чтобы карточки не перекрывались кнопкой "Далее"
  },
  sectionTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  listContainer: {
    width: "100%",
    gap: 8, // Строгий шаг между карточками в списке по твоему обновленному ТЗ
  },
  // Базовый стиль космической градиентной плашки
  listItemGradient: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    shadowColor: "#89C579", // Подсветка тени под цвет твоих успехов
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2, // Стабильный рендер теней на Android
  },
  // Белый круглый бэдж для иконки
  emojiWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1, // Идеальная посадка по высоте первой строки букв
    // Микро-тень для самого кружка
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
    gap: 2, // Микро-шаг между названием карточки и описанием
  },
  cardTitle: {
    fontSize: 14,
    color: "#54A341", // Твой сочный благородный зеленый на основе greatSuccess
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 15, // Межстрочный интервал строго по твоему стандарту
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
