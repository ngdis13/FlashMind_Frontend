// --------------------------- React & Анимации ---------------------------
import React, { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// --------------------------- React Native ---------------------------
import { View, ScrollView, StyleSheet, Image } from "react-native";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { LogoCuteStar } from "@/components/LogoCuteStar";

// --------------------------- Стили & Графика ---------------------------
import { Typography } from "@/styles/Typography";
import { AppEmojis } from "@/assets/emoji/emoji";
import { colors } from "@/styles/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/Logo";

// --------------------------- Пропсы & Интерфейсы ---------------------------
interface InsightItem {
  title: string;
  text: string;
}

interface AiInsightsProps {
  data: {
    analysis_date: string;
    analysis_next_date: string;
    analysis_success: boolean;
    insights: InsightItem[];
    problem_areas: InsightItem[];
    recommendations: InsightItem[];
    goals: InsightItem[];
  };
  onBack: () => void;
}

/**
 * Премиальный светлый экран AI-аналитики статистики пользователя.
 * Содержит нативные микроанимации, мягкие тени и цветовое кодирование блоков.
 */
export const AiInsightsScreen = ({ data, onBack }: AiInsightsProps) => {
  const formattedDate = new Date(data.analysis_date).toLocaleDateString(
    "ru-RU",
    {
      day: "numeric",
      month: "long",
    },
  );

  /** Обратный отсчёт до следующего отчёта */
  const calcCountdown = () => {
    const now = new Date().getTime();
    const next = new Date(data.analysis_next_date).getTime();
    const diff = next - now;
    if (diff <= 0) return "уже доступен";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let result = "";
    if (days > 0) result += `${days} дн `;
    if (hours > 0 || days > 0) result += `${hours} ч `;
    result += `${mins} мин`;
    return result;
  };

  const [countdown, setCountdown] = useState(calcCountdown());

  useEffect(() => {
    const timer = setInterval(() => setCountdown(calcCountdown()), 1000);
    return () => clearInterval(timer);
  }, [data.analysis_next_date]);

  // Переменные для управления ИИ-анимацией искорки
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Запуск бесконечного цикла «дыхания» и покачивания звёздочки
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      true,
    );

    rotation.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(10, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  // Связываем анимацию со стилями
  const animatedSparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.screenContainer}>
      {/* Магическое фоновое свечение — создает едва уловимый дорогой перелив на белом фоне */}


      {/* Приглушённый логотип на фоне */}
      <View style={styles.logoBackground}>
        <Logo size={300} />
      </View>

      <ScrollView
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Главная Шапка */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.mainTitle}>
            AI Анализ статистики{" "}
            <Animated.View
              style={[styles.titleIconContainer, animatedSparkleStyle]}
            >
              <Image source={AppEmojis.sparkles} style={styles.titleIcon} />
            </Animated.View>
          </Typography>
          <Typography variant="p" style={styles.dateText}>
            Обновлено: {formattedDate}
          </Typography>
          <Typography variant="p" style={styles.countdownText}>
            Следующий отчёт через: {countdown}
          </Typography>
        </View>

        {/* Раздел 1: Инсайты и успехи */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.sectionTitle}>
            Инсайты
          </Typography>
          <View style={styles.listContainer}>
            {data.insights.map((item, index) => (
              /* Заменяем View на LinearGradient и настраиваем перелив слева направо */
              <LinearGradient
                key={index}
                colors={["#EBF6E8", "#FFFFFF"]} // Из мягкого мятного (greatSuccess) в чистый белый
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.listItemGradient, styles.cardInsight]}
              >
                <View style={styles.emojiWrapper}>
                  <Image source={AppEmojis.rocket} style={styles.inlineEmoji} />
                </View>
                <View style={styles.cardContent}>
                  <Typography
                    variant="h3"
                    style={[styles.cardTitle, styles.textInsight]}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="h3" style={styles.cardBody}>
                    {item.text}
                  </Typography>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Раздел 2: Проблемные зоны */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.sectionTitle}>
            Проблемные зоны
          </Typography>
          <View style={styles.listContainer}>
            {data.problem_areas.map((item, index) => (
              /* Заменяем View на LinearGradient с розово-белым космическим переливом */
              <LinearGradient
                key={index}
                colors={["#FFF0F1", "#FFFFFF"]} // Из мягкого пастельно-розового (statusColorRed) в чистый белый
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.listItemGradient, styles.cardWarning]}
              >
                <View style={styles.emojiWrapper}>
                  <Image
                    source={AppEmojis.warning}
                    style={styles.inlineEmoji}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Typography
                    variant="h3"
                    style={[styles.cardTitle, styles.textWarning]}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="h3" style={styles.cardBody}>
                    {item.text}
                  </Typography>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Раздел 3: Рекомендации */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.sectionTitle}>
            Рекомендации
          </Typography>
          <View style={styles.listContainer}>
            {data.recommendations.map((item, index) => (
              /* Заменяем View на LinearGradient с янтарно-белым космическим переливом */
              <LinearGradient
                key={index}
                colors={["#FFF9E6", "#FFFFFF"]} // Из мягкого янтарного (yellow3) в чистый белый
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.listItemGradient, styles.cardIdea]}
              >
                <View style={styles.emojiWrapper}>
                  <Image
                    source={AppEmojis.lightbulb}
                    style={styles.inlineEmoji}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Typography
                    variant="h3"
                    style={[styles.cardTitle, styles.textIdea]}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="h3" style={styles.cardBody}>
                    {item.text}
                  </Typography>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Раздел 4: План целей */}
        <View style={styles.lastSectionContainer}>
          <Typography variant="p" style={styles.sectionTitle}>
            План целей на неделю
          </Typography>
          <View style={styles.listContainer}>
            {data.goals.map((item, index) => (
              /* Заменяем View на LinearGradient с фиолетово-белым космическим переливом */
              <LinearGradient
                key={index}
                colors={["#F3F1FF", "#FFFFFF"]} // Из мягкого брендового фиолетового (mainColor) в чистый белый
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.listItemGradient, styles.cardGoal]}
              >
                <View style={styles.checkboxWrapper}>
                  <View style={styles.checkboxMock} />
                </View>
                <View style={styles.cardContent}>
                  <Typography
                    variant="h3"
                    style={[styles.cardTitle, styles.textGoal]}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="h3" style={styles.cardBody}>
                    {item.text}
                  </Typography>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Кнопка закрытия */}
      <View style={styles.buttonContainer}>
        <MainButton title="Погнали!" onPress={onBack} />
      </View>
    </View>
  );
};

// --------------------------- Магические UI-стили ---------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background, // Насыщенный белый с легким лавандовым тоном
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  // ИИ-облака на фоне
  magicBackgroundGlowLeft: {
    position: "absolute",
    top: -50, // Сместили чуть выше, чтобы красиво подсветить шапку приложения
    left: -120,
    width: 320, // Увеличили размер круга
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.mainColor, // Твой чистый colors.mainColor
    opacity: 0.08, // Сделали в 3 раза ярче и выразительнее!
    blurRadius: 80, // Разработчик может использовать свойство blurRadius в RN (если поддерживает платформа)
  },
  magicBackgroundGlowRight: {
    position: "absolute",
    top: 350, // Центрируем ровно в районе Проблемных зон и Рекомендаций
    right: -140,
    width: 350, // Сделали круг массивнее
    height: 350,
    borderRadius: 175,
    backgroundColor: colors.mainColor, // Твой чистый colors.yellow3
    opacity: 0.07, // Сделали сочнее!
  },
  header: {
    gap: 4,
    marginBottom: 16,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  mainTitle: {
    fontWeight: "900",
    letterSpacing: -0.2,
    flexDirection: "row",
    alignItems: "center",
  },
  titleIconContainer: {
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  titleIcon: {
    width: 18,
    height: 18,
  },
  dateText: {
    color: colors.darkGray,
    fontWeight: "600",
  },
  countdownText: {
    color: colors.darkMainColor,
    fontWeight: "600",
    marginTop: 2,
  },
  // Системные отступы блоков по вашему ТЗ
  sectionContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 16, // Увеличили шаг между блоками, чтобы экран "дышал"
  },
  lastSectionContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.darkGray,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4,
  },
  listContainer: {
    width: "100%",
    gap: 10, // Шаг между карточками стал чуть свободнее
  },
  // Парящие карточки с цветными премиум-тенями
  listItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    // Мягкая, дорогая тень без грязи
    shadowColor: "#1C1C1E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  listItemGradient: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18, // Красивое мягкое скругление углов

    // Премиальная легкая тень, которая приподнимает карточку
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3, // Для Android
  },

  cardInsight: { shadowColor: "#89C579" }, // Мягкий зеленый ореол (greatSuccess)
  cardWarning: { shadowColor: "#FB8B93" }, // Мягкий розовый ореол (statusColorRed)
  cardIdea: { shadowColor: "#FFCF0F" }, // Мягкий янтарный ореол (yellow3)
  cardGoal: { shadowColor: "#6A5AE0" },
  emojiWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    // Тень для бэджа, чтобы он "горел" на цветном фоне
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  checkboxWrapper: {
    width: 24,
    alignItems: "center",
    paddingTop: 4,
  },
  cardContent: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 15, // Интервал строго по вашему ТЗ
    color: colors.darkMainColor,
  },
  textInsight: { color: "#54A341" }, // Глубокий зеленый на основе greatSuccess
  textWarning: { color: "#E05D66" }, // Контрастный красный на основе statusColorRed
  textIdea: { color: "#C69B00" }, // Благородный янтарный на основе yellow3
  textGoal: { color: colors.mainColor },

  checkboxMock: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.mainColor,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.mainColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  inlineEmoji: {
    width: 13,
    height: 13,
  },
  logoBackground: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -150 }],
    opacity: 0.07,
    zIndex: 0,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "transparent",
  },
});
