// --------------------------- React ---------------------------
import { useState } from "react";

// --------------------------- React Native ---------------------------
import { View, Image, Pressable } from "react-native";

// --------------------------- Expo ---------------------------
import { useRouter } from "expo-router";

// --------------------------- Сторонние библиотеки ---------------------------
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-create/styles/CreateDecks.styles";

// --------------------------- Компоненты ---------------------------
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import { Logo } from "@/components/Logo";
import { ColorPalette } from "@/feature/decks/components/colorPalette";

// --------------------------- Ассеты ---------------------------
import ReturnIcon from "@/assets/icons/ReturnIcon.png";

// --------------------------- Хуки и хранилища ---------------------------
import { useDecks } from "@/storage/hooks/useDecks";

/**
 * Экран создания новой колоды
 * 
 * @component
 * @returns {JSX.Element} React компонент экрана создания колоды
 * 
 * @description
 * Экран предоставляет:
 * - Поле для ввода названия колоды (обязательное)
 * - Поле для ввода описания (опционально, до 4 строк)
 * - Выбор цвета колоды через модальную палитру
 * - Кнопку создания колоды с валидацией
 * - Информационный блок с логотипом
 * - Возврат к списку колод
 * 
 * @example
 * // Использование в навигации
 * router.push("/create-decks")
 */
export default function CreateDecksScreen() {
  // --------------------------- Навигация ---------------------------
  const router = useRouter();

  // --------------------------- Хуки ---------------------------
  const { createNewDeck } = useDecks();

  // --------------------------- Состояния ---------------------------
  /**
   * Название колоды
   */
  const [name, setName] = useState<string>("");

  /**
   * Описание колоды
   */
  const [description, setDescription] = useState<string>("");

  /**
   * Флаг загрузки при создании колоды
   */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Управление видимостью модального окна палитры цветов
   */
  const [visibleColorPalette, setVisibleColorPalette] = useState<boolean>(false);

  /**
   * Выбранный цвет для колоды
   */
  const [selectedColor, setSelectedColor] = useState<string>(colors.red1);

  // --------------------------- Обработчики ---------------------------
  /**
   * Обрабатывает изменение описания колоды
   * Ограничивает количество строк до 4
   * 
   * @param {string} text - Новый текст описания
   */
  const handleDescriptionChange = (text: string): void => {
    const lines = text.split("\n");
    if (lines.length <= 4) {
      setDescription(text);
    }
  };

  /**
   * Создает новую колоду с валидацией полей
   * @async
   */
  const handleCreateDecks = async (): Promise<void> => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Toast.show({
        type: "error",
        text1: "Заполните имя колоды",
        text2: "Колода не может быть создана без названия",
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createNewDeck(trimmedName, {
        description: description.trim(),
        color: selectedColor,
      });

      if (result) {
        Toast.show({
          type: "success",
          text1: "Колода создана",
          position: "bottom",
          visibilityTime: 3000,
        });
        router.replace("/decks");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const serverMessage = err?.message || "Попробуйте снова";

      Toast.show({
        type: "error",
        text1: "Ошибка создания колоды",
        text2: serverMessage,
        position: "bottom",
        visibilityTime: 3000,
      });
      console.error("Ошибка при создании:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Открывает/закрывает модальное окно палитры цветов
   */
  const handleColorModalToggle = (): void => {
    setVisibleColorPalette((prev) => !prev);
  };

  // --------------------------- Отрисовка ---------------------------
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View
        style={[
          commonStyles.container,
          { flex: 1, justifyContent: "space-between", paddingBottom: 20 },
        ]}
      >
        <View style={commonStyles.mainContent}>
          <View style={styles.header}>
            <Pressable onPress={() => router.replace("/decks")} hitSlop={10}>
              <Image
                source={ReturnIcon}
                style={{ width: 12, height: 22, top: 5 }}
                resizeMode="contain"
              />
            </Pressable>

            <Typography variant="h1" style={{ marginBottom: 16 }}>
              Создание новой колоды
            </Typography>
          </View>

          <View style={styles.inputBox}>
            <Input
              style={[{ textAlign: "left" }, commonStyles.mainBox]}
              placeholder={"Название"}
              value={name}
              onChangeText={setName}
            />
            <Input
              placeholder="Описание"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline={true}
              maxLength={120}
              style={[
                {
                  textAlign: "left",
                  height: 130,
                  textAlignVertical: "top",
                },
                commonStyles.mainBox,
              ]}
            />

            {/* Кнопка открытия палитры */}
            <Pressable
              style={[commonStyles.mainBox, styles.colorBox]}
              onPress={handleColorModalToggle}
            >
              <View
                style={[
                  styles.colorEllipse,
                  { backgroundColor: selectedColor },
                ]}
              />
              <Typography variant="h2">Цвет</Typography>
            </Pressable>
          </View>

          <View style={styles.infoBox}>
            <Logo size={160} />
            <Typography color={colors.darkGray} style={{ textAlign: "center" }}>
              После создания колоды ты сможешь добавить карточки в режиме
              редактирования колоды
            </Typography>
          </View>
        </View>

        <View style={styles.createDecksButton}>
          <MainButton
            style={styles.createDecksButton}
            title="Создать колоду"
            disabled={isLoading}
            onPress={handleCreateDecks}
          />
        </View>
      </View>

      {/* Модальное окно палитры цветов */}
      {visibleColorPalette && (
        <ColorPalette
          onCancel={handleColorModalToggle}
          onSelectColor={setSelectedColor}
        />
      )}
    </View>
  );
}