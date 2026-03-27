import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { View, Image, Pressable } from "react-native";
import { styles } from "../styles/index.styles";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useRouter } from "expo-router";
import { Input } from "@/components/Input";
import { useState } from "react";
import { MainButton } from "@/components/MainButton";
import { Logo } from "@/components/Logo";
import { colors } from "@/styles/Colors";
import { createNewDeck } from "../api/createDecks.api";

export default function CreateDecksScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDescriptionChange = (text: string) => {
    // Разбиваем текст по символу новой строки
    const lines = text.split("\n");

    // Если строк 4 или меньше — разрешаем ввод
    if (lines.length <= 4) {
      setDescription(text);
    }
  };

  const handleCreateDecks = async () => {
    if (!name.trim()) return;

    try {
      const result = await createNewDeck({
        name: name,
        description: description,
      });

      if (result) {
        router.replace("/decks");
      }
    } catch (e) {
      console.error("Ошибка при создании:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        commonStyles.container,
        { flex: 1, justifyContent: "space-between", paddingBottom: 20 },
      ]}
    >
      <View style={commonStyles.mainContent}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
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
            style={{ textAlign: "left" }}
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
            style={{
              textAlign: "left",
              height: 130,
              textAlignVertical: "top", // Текст начинается сверху
            }}
          />
        </View>

        <View style={styles.infoBox}>
          <Logo size={160} />
          <Typography color={colors.darkGray} style={{ textAlign: "center" }}>
            После создания колоды ты сможешь добавить карточки в режиме
            редактирования колоды
          </Typography>
        </View>
      </View>
      <MainButton
        style={styles.createDecksButton}
        title="Создать колоду"
        disabled={isLoading}
        onPress={handleCreateDecks}
      />
    </View>
  );
}
