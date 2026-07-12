// --------------------------- React ---------------------------
import { useState } from "react";

// --------------------------- React Native ---------------------------
import { ScrollView, View, Image, Pressable, TextInput } from "react-native";

// --------------------------- Expo ---------------------------
import { useLocalSearchParams, useRouter } from "expo-router";

// --------------------------- Сторонние библиотеки ---------------------------
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { variants } from "@/styles/Typography";
import { styles } from "@/feature-decks/deck-create-card/styles/CreateCard.style";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";

// --------------------------- Ассеты ---------------------------
import ReturnIcon from "@/assets/icons/ReturnIcon.png";

// --------------------------- Хуки и хранилища ---------------------------
import { useCards } from "@/storage/hooks/useCards";

/**
 * Экран создания новой карточки
 * 
 * @component
 * @returns {JSX.Element} React компонент экрана создания карточки
 * 
 * @description
 * Экран предоставляет:
 * - Поле ввода термина (front) - обязательное
 * - Поле ввода определения (back) - обязательное
 * - Кнопку возврата к колоде
 * - Кнопку создания карточки с валидацией
 * - Подписи полей "термин" и "определение"
 * 
 * @example
 * // Использование в навигации
 * router.push(`/decks/${deckId}/create-card?deckId=${deckId}`)
 */
export default function CreateCardView(){
  // --------------------------- Параметры маршрута ---------------------------
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // --------------------------- Хуки ---------------------------
  const { addCard } = useCards();

  // --------------------------- Состояния ---------------------------
  /**
   * Текст термина (лицевая сторона карточки)
   */
  const [front, setFront] = useState<string>("");
  
  /**
   * Текст определения (обратная сторона карточки)
   */
  const [back, setBack] = useState<string>("");

  // --------------------------- Обработчики ---------------------------
  /**
   * Возвращает на экран просмотра колоды
   */
  const handleBack = (): void => {
    router.push(`/decks/${id}`);
  };

  /**
   * Создает новую карточку с валидацией полей
   * @async
   */
  const handleCreateCard = async (): Promise<void> => {
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
      console.log(`📝 Экран: Создаем карточку в колоде ${id}`);

      // Вызываем метод. Стор создаст карточку на сервере, запишет в кэш и САМ выставит флаг isActual: false
      await addCard(id as string, trimmedFront, trimmedBack);

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
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", width: "100%" }}
          showsVerticalScrollIndicator={false}
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
                  <TextInput
                    style={[styles.underlineInput, variants.h2]}
                    placeholder="Введите термин"
                    placeholderTextColor={colors.darkGray}
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
                    value={back}
                    onChangeText={setBack}
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
            style={styles.createCardButton}
            title="Создать карточку"
            onPress={handleCreateCard}
          />
        </View>
      </View>
    </View>
  );
}