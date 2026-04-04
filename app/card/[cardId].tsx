import { Typography, variants } from "@/styles/Typography";
import { ScrollView, View, Image, Pressable, TextInput } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { commonStyles } from "@/styles/Common";
import { styles } from "./cardView.style";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDecks } from "@/storage/hooks/useDecks";
import { useEffect, useState } from "react";
import { colors } from "@/styles/Colors";
import { MainButton } from "@/components/MainButton";
import { Card } from "@/storage/types/types";

export default function CardView() {
  const { cardId } = useLocalSearchParams<{cardId: string }>();
  const router = useRouter();
  const { getCardById } = useDecks();

  const [card, setCard] = useState<Card | null>(null);
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");
  const handleUpdateCard = async () => {};

  const handleBack = () => {
    router.back();
  };

 useEffect(() => {
    if (cardId) {
      loadCard();
    }
  }, [cardId]);

  const loadCard = async () => {
    try {
      console.log("Загружаем карточку:", cardId);
      
      const foundCard = await getCardById(cardId as string);
      console.log("Найденная карточка:", foundCard);
      
      setCard(foundCard);
      
      if (foundCard) {
        setFront(foundCard.front || "");
        setBack(foundCard.back || "");
      }
    } catch (error) {
      console.error("Ошибка загрузки карточки:", error);
    } 
  };
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
