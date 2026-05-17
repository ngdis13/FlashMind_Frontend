import { commonStyles } from "@/styles/Common";
import { Pressable, View, Image, ScrollView } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { Typography } from "@/styles/Typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDecks } from "@/storage/hooks/useDecks";
import { styles } from "../../styles/settingsDeck.style";
import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
import { colors } from "@/styles/Colors";

export default function settingsDecks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { decks } = useDecks();

  // Используем router.back() — это гарантирует, что целевой экран вспомнит свой стейт
  const handleBack = () => {
    router.push(`/decks/${id}`);
  };

  const handleSaveEdit = () => {
    // Здесь будет логика сохранения изменений
  };

  useEffect(() => {
    const deck = decks.find((d) => d.id === id);
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
  }, [decks, id]);

  return (
    // 1. Внешняя фоновая подложка на весь экран ПК (скрывает пустые поля справа и слева)
    <View style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}>
      
      {/* 2. Адаптивный контейнер шириной 800px (из commonStyles), центрированный на экране */}
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          {/* Шапка экрана */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Image source={ReturnIcon} style={{ width: 12, height: 22 }} />
            </Pressable>
            <Typography variant="h1">Настройки колоды</Typography>
          </View>

          {/* Блок полей ввода */}
          <View style={styles.infoBox}>
            <Input
              style={[commonStyles.mainBox, styles.input]}
              placeholder="Название колоды"
              value={name}
              autoCapitalize="none"
              onChangeText={setName}
            />

            <Input
              style={[
                commonStyles.mainBox,
                styles.input,
                styles.descriptionInput,
              ]}
              placeholder="Описание колоды"
              value={description}
              autoCapitalize="none"
              multiline={true}
              onChangeText={setDescription}
            />

            <Pressable style={[commonStyles.mainBox, styles.colorPickerRow]}>
              <View style={styles.colorCircle} />
              <Typography variant="h2" style={styles.colorText}>
                Цвет колоды
              </Typography>
            </Pressable>
          </View>
        </ScrollView>

        {/* 3. ИСПРАВЛЕНИЕ: Ограничиваем блок кнопки до 800px, чтобы он совпадал по ширине с инпутами */}
        <View style={[styles.bottomButtonContainer, { maxWidth: 800 }]}> 
          <MainButton
            style={styles.button}
            title="Сохранить изменения"
            onPress={handleSaveEdit}
          />
        </View>
      </View>
    </View>
  );

}
