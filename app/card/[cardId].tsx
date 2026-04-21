import { Typography, variants } from "@/styles/Typography";
import {
  ScrollView,
  View,
  Image,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { commonStyles } from "@/styles/Common";
import { styles } from "./cardView.style";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useDecks } from "@/storage/hooks/useDecks";
import { useCallback, useEffect, useState } from "react";
import { colors } from "@/styles/Colors";
import { MainButton } from "@/components/MainButton";
import { Card } from "@/storage/types/types";

export default function CardView() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const { getCardById, updateCard } = useDecks();

  const [card, setCard] = useState<Card | null>(null);
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");
  const [isLoaded, setIsLoaded] = useState(false); 

  const handleUpdateCard = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    try {
      // 1. Получаем обновленную карточку СРАЗУ из ответа сервера
      const updatedCard = await updateCard(cardId as string, front.trim(), back.trim());

      if (updatedCard) {
        // 2. Локально обновляем стейт, чтобы useFocusEffect не перетер его старыми данными
        setCard(updatedCard);
        setFront(updatedCard.front);
        setBack(updatedCard.back);

        Alert.alert("Успех!", "Карточка успешно обновлена", [
          { text: "OK", onPress: () => router.back() },
        ]);

        router.back()
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось обновить карточку");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const loadCard = useCallback(async () => {
    if (!cardId) return;
    try {
      const foundCard = await getCardById(cardId);
      console.log("Получили карточку", foundCard)
      if (foundCard) {
        setCard(foundCard);
        setFront(foundCard.front || "");
        setBack(foundCard.back || "");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  }, [cardId, getCardById]);

  useFocusEffect(
    useCallback(() => {
      loadCard(true); 
    }, [cardId])
  );

  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
      <ScrollView>
        <View style={[commonStyles.mainContent]}>
          <View style={styles.header}>
            <Pressable onPress={handleBack}>
              <Image
                source={ReturnIcon}
                style={{ width: 12, height: 22, top: -7 }}
              />
            </Pressable>

            <Typography variant="h1" style={{ marginBottom: 16 }}>
              Вернуться к колоде
            </Typography>
          </View>
          <View style={[commonStyles.infoBox, { flexDirection: "column" }]}>
            <View style={styles.inputWrapper}>
              <Typography variant="h3" style={styles.firstHeader}>
                термин
              </Typography>
              <TextInput
                style={[styles.underlineInput, variants.h2]}
                placeholder="Введите термин"
                placeholderTextColor={colors.darkGray}
                underlineColorAndroid="transparent"
                value={front}
                onChangeText={setFront}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Typography variant="h3" style={styles.firstHeader}>
                определение
              </Typography>
              <TextInput
                style={[styles.underlineInput, variants.h2]}
                placeholder="Введите определение"
                placeholderTextColor={colors.darkGray}
                underlineColorAndroid="transparent"
                value={back}
                onChangeText={setBack}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <MainButton
        style={styles.updateCardButton}
        title="Сохранить"
        onPress={handleUpdateCard}
      />
    </View>
  );
}
