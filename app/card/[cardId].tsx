import { Typography } from "@/styles/Typography";
import { ScrollView, View, Image, Pressable, Platform } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { commonStyles } from "@/styles/Common";
import { styles } from "./cardView.style";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useState } from "react";
import { colors } from "@/styles/Colors";
import { MainButton } from "@/components/MainButton";
import { Card } from "@/storage/types/types";
import { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import { useCards } from "@/storage/hooks/useCards";
import { RichTextEditor } from "@/feature-decks/components/RichTextEditor";

export default function CardView() {
  const { cardId, deckId } = useLocalSearchParams<{
    cardId: string;
    deckId: string;
  }>();
  const router = useRouter();

  const { getCardById, updateCard } = useCards();

  const [card, setCard] = useState<Card | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const handleUpdateCard = async () => {
    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    if (!trimmedFront || !trimmedBack) {
      Toast.show({
        type: "error",
        text1: "Заполните все поля",
        text2: "Термин и определение не могут быть пустыми",
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      console.log(`📝 Экран: Обновляем карточку ${cardId} в колоде ${deckId}`);

      const updatedCard = await updateCard(
        cardId as string,
        trimmedFront,
        trimmedBack,
      );

      if (updatedCard) {
        setCard(updatedCard as Card);
        setFront(updatedCard.front);
        setBack(updatedCard.back || "");

        Toast.show({
          type: "success",
          text1: "Изменения сохранены!",
          position: "bottom",
          visibilityTime: 3000,
        });

        router.push(`/decks/${deckId}`);
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const serverMessage =
        err.response?.data?.message ||
        err?.message ||
        "Не удалось обновить карточку";

      Toast.show({
        type: "error",
        text1: "Ошибка обновления карточки",
        text2: serverMessage,
        position: "bottom",
        visibilityTime: 3000,
      });
      console.error(err);
    }
  };

  const handleBack = () => {
    router.push(`/decks/${deckId}`);
  };

  const loadCard = useCallback(async () => {
    if (!cardId) return;
    try {
      const foundCard = await getCardById(cardId);
      if (foundCard) {
        setCard(foundCard as Card);
        setFront(foundCard.front || "");
        setBack(foundCard.back || "");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [cardId, getCardById]);

  useFocusEffect(
    useCallback(() => {
      loadCard();
    }, [loadCard]),
  );

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", width: "100%" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={Platform.OS === "android"}
        >
          <View
            style={[
              commonStyles.content,
              { width: "100%", paddingHorizontal: 16 },
            ]}
          >
            <View
              style={[
                commonStyles.mainContent,
                { width: "100%", paddingHorizontal: 0 },
              ]}
            >
              <View style={styles.header}>
                <Pressable
                  onPress={handleBack}
                  style={{
                    padding: 12,
                    marginLeft: -12,
                    marginRight: -8,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={ReturnIcon}
                    style={{ width: 12, height: 22, top: -7 }}
                  />
                </Pressable>
                <Typography variant="h1" style={{ marginBottom: 16 }}>
                  Вернуться к колоде
                </Typography>
              </View>

              <View
                style={[
                  commonStyles.infoBox,
                  { flexDirection: "column", width: "100%" },
                ]}
              >
                <View style={styles.inputWrapper}>
                  <Typography variant="h3" style={styles.firstHeader}>
                    термин
                  </Typography>
                  <RichTextEditor
                    placeholder="Введите термин"
                    value={front}
                    onChange={setFront}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Typography variant="h3" style={styles.firstHeader}>
                    определение
                  </Typography>
                  <RichTextEditor
                    placeholder="Введите определение"
                    value={back}
                    onChange={setBack}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={{ width: "100%", paddingHorizontal: 16, alignItems: "center" }}
        >
          <MainButton
            style={styles.updateCardButton}
            title="Сохранить"
            onPress={handleUpdateCard}
          />
        </View>
      </View>
    </View>
  );
}
