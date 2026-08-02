import { useState } from "react";
import { ScrollView, View, Image, Pressable, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-create-card/styles/CreateCard.style";

import { MainButton } from "@/components/MainButton";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useCards } from "@/storage/hooks/useCards";
import { RichTextEditor } from "../../components/RichTextEditor";

export default function CreateCardView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addCard } = useCards();

  // JSON-строки или HTML-разметка от продвинутого редактора
  const [front, setFront] = useState<string>("");
  const [back, setBack] = useState<string>("");

  const handleBack = (): void => {
    router.push(`/decks/${id}`);
  };

  const handleCreateCard = async (): Promise<void> => {
    // Валидация: проверяем, что стейт не пустой
    if (!front || !back) {
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
      console.log(`📝 Экран: Создаем карточку в колоде ${id}`);

      // Отправляем форматированные данные в базу
      await addCard(id as string, front, back);

      Toast.show({
        type: "success",
        text1: "Карточка создана!",
        position: "bottom",
        visibilityTime: 3000,
      });

      router.push(`/decks/${id}`);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const serverMessage =
        err.response?.data?.message || err?.message || "Попробуйте снова";

      Toast.show({
        type: "error",
        text1: "Ошибка создания карточки",
        text2: serverMessage,
        position: "bottom",
        visibilityTime: 3000,
      });
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}>
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingTop: 20,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={Platform.OS === 'android'}
        >

          <View style={styles.header}>
            <Pressable onPress={handleBack}>
              <Image source={ReturnIcon} style={{ width: 12, height: 22}} />
            </Pressable>
            <Typography variant="h1" >
              Вернуться к колоде
            </Typography>
          </View>

          <View style={[commonStyles.infoBox, { flexDirection: "column", width: "100%" }]}>

            {/* ТЕРМИН */}
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

            {/* ОПРЕДЕЛЕНИЕ */}
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
        </ScrollView>

        <View style={{ width: "100%", paddingHorizontal: 10, alignItems: "center" }}>
          <MainButton
            style={styles.createCardButton}
            title="Создать карточку"
            onPress={handleCreateCard}
          />
        </View>
      </View>
    </View>
  );
}
