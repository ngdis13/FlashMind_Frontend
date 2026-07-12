import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { View, Image, Pressable } from "react-native";
import { styles } from "@/feature-decks/styles/CreateDecks.styles";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useRouter } from "expo-router";
import { Input } from "@/components/Input";
import { useState } from "react";
import { MainButton } from "@/components/MainButton";
import { Logo } from "@/components/Logo";
import { colors } from "@/styles/Colors";
import { ColorPalette } from "@/feature/decks/components/colorPalette";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";
import { useDecks } from "@/storage/hooks/useDecks";

export default function CreateDecksScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Стейт для управления видимостью модалки
  const [visibleColorPalette, setVisibleColorPalette] = useState(false);

  const { createNewDeck } = useDecks();

  // 2. Стейт для хранения выбранного цвета (по умолчанию ставим, например, colors.red1)
  const [selectedColor, setSelectedColor] = useState(colors.red1);

  const handleDescriptionChange = (text: string) => {
    const lines = text.split("\n");
    if (lines.length <= 4) {
      setDescription(text);
    }
  };

  const handleCreateDecks = async () => {
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


  const handleColorModalToggle = () => {
    setVisibleColorPalette((prev) => !prev);
  };

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
              {/* 4. МеняемbackgroundColor на выбранный стейт selectedColor */}
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

      {/* 5. Подключаем модальное окно */}
      {visibleColorPalette && (
        <ColorPalette
          onCancel={handleColorModalToggle}
          onSelectColor={setSelectedColor} // Передаем функцию изменения цвета
        />
      )}
    </View>
  );
}

