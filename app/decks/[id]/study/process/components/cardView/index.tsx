import { commonStyles } from "@/styles/Common";
import {
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Animated,
} from "react-native";
import { StudyCard } from "../../api/api";
import { Typography } from "@/styles/Typography";
import { useEffect, useRef, useState } from "react";

interface Props {
  card: StudyCard | undefined;
  isFirstCard: boolean; // Добавляем новый проп
}

export const StudyCardView = ({ card, isFirstCard }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [wasFlipped, setWasFlipped] = useState(false); // Отслеживаем, был ли хоть один переворот

  const flipAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current; // Анимация для подсказки

  // Логика появления/исчезновения подсказки
  useEffect(() => {
    if (isFirstCard && !isFlipped && !wasFlipped) {
      // Плавно показываем на первой карточке
      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 800,
        delay: 500, // Появится чуть позже самой карточки
        useNativeDriver: true,
      }).start();
    } else {
      // Плавно скрываем навсегда
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isFirstCard, isFlipped, wasFlipped]);

  useEffect(() => {
    setIsFlipped(false);
    flipAnim.setValue(0);
  }, [card?.id]);

  const handleFlip = () => {
    if (!wasFlipped) setWasFlipped(true); // Запоминаем, что пользователь нажал

    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Интерполяции для 3D
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [1, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.45, 0.5],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.touchArea} onPress={handleFlip}>
        {/* ПЕРЕДНЯЯ СТОРОНА */}
        <Animated.View
          style={[
            commonStyles.mainBox,
            styles.card,
            styles.cardFront,
            {
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Typography variant="h2" style={[styles.mainText, {fontWeight: 800, fontSize: 21}]}>
              {card?.front}
            </Typography>
          </ScrollView>

          {/* Анимированная подсказка */}
          <Animated.View style={{ opacity: hintOpacity }}>
            <Typography variant="h3" color="gray" style={styles.hintTextInside}>
              Нажми, чтобы перевернуть
            </Typography>
          </Animated.View>
        </Animated.View>

        {/* ЗАДНЯЯ СТОРОНА */}
        <Animated.View
          style={[
            commonStyles.mainBox,
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }], opacity: backOpacity },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Typography variant="h2" style={styles.mainText}>
              {card?.back}
            </Typography>
          </ScrollView>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 24 },
  touchArea: { flex: 1 },
  card: { flex: 1, backfaceVisibility: "hidden", paddingBottom: 20 },
  cardFront: { backgroundColor: "#EDEEFF" },
  cardBack: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  mainText: { textAlign: "center"},
  hintTextInside: { textAlign: "center", paddingBottom: 10 },
});
