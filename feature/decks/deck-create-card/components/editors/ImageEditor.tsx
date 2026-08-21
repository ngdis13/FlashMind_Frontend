// feature-decks/deck-create-card/screens/ImageEditor.tsx
import { ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { useCardStore } from "@/store/card.store";
import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";
import { AppEmojis } from "@/assets/emoji/emoji"; // Твои эмодзи

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import searchButton from "@/feature-decks/assets/searchButton.png";
import { Logo } from "@/components/Logo";

export const ImageEditor = () => {
  const router = useRouter();
  const { side, blockId } = useLocalSearchParams<{
    side: string;
    blockId: string;
  }>();

  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);
  const updateDraftBlockValue = useCardStore((s) => s.updateDraftBlockValue);

  const sideKey: "front" | "back" = side === "front" ? "front" : "back";
  const block = (sideKey === "front" ? front : back).find(
    (b) => b.id === blockId,
  );
  
  // Достаем сохраненный url из стора (убедись, что обновила стор, как мы договаривались шагом ранее)
  const initialUrl = block && block.type === "image" ? block.url : "";

  // Локальный стейт для хранения пути к выбранной фотографии
  const [localUrl, setLocalUrl] = useState<string>(initialUrl || "");
  const [searchText, setSearchText] = useState("");

  const handleBack = (): void => {
    router.back();
  };

  // Функция открытия галереи устройства через Expo Image Picker
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Приложению нужен доступ к галерее, чтобы загрузить фото.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Позволяет обрезать/кадрировать фотку
      quality: 0.8,        // Оптимальное сжатие для бэкенда
    });

    if (!result.canceled && result.assets) {
      setLocalUrl(result.assets[0].uri); // Сохраняем путь в локальный стейт
    }
  };

  // Сохраняем данные в Zustand при нажатии нижней кнопки "Готово"
  const handleSave = (): void => {
    updateDraftBlockValue(sideKey, blockId, localUrl);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}>
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 20,
            paddingBottom: 30,
            alignItems: "center"
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Шапка */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={20}>
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Изображение</Typography>
          </View>

          {/* Инпут поиска из интернета */}
          <View style={styles.searchBox}>
            <Input
              style={{ textAlign: "left" }}
              placeholder={"Поиск картинок в интернете"}
              value={searchText}
              onChangeText={setSearchText}
            />
            <Pressable style={styles.searchButton}>
              <Image source={searchButton} style={{ width: 18, height: 18 }} />
            </Pressable>
          </View>

          {/* Контент по центру: если картинка выбрана — показываем превью, если нет — звездочку */}
          <View style={styles.centerContent}>
            {localUrl ? (
              <Image source={{ uri: localUrl }} style={styles.mainPreviewImage} />
            ) : (
              <>
                <Logo size={143}/>
                <Typography variant="h2" color={colors.darkGray} style={styles.descriptionText}>
                  Напишите любое слово, и мы вместе подберем классное изображение из сети
                </Typography>
              </>
            )}
          </View>
        </ScrollView>

        {/* Кнопки действий в самом низу */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: 10,
            alignItems: "center",
            marginBottom: BOTTOM_MARGIN,
            gap: 10 // Если будут две кнопки
          }}
        >
          {/* Кнопка Галереи (если фото уже выбрано, она дает возможность перевыбрать его) */}
          <MainButton
            style={styles.actionButton}
            title={localUrl ? "Изменить фото" : "Добавить из галереи"}
            onPress={handlePickImage}
          />

          {/* Кнопка "Готово" появляется только тогда, когда фото выбрано, чтобы подтвердить сохранение */}
          {localUrl ? (
            <MainButton
              style={[styles.actionButton, { backgroundColor: colors.mainColor }]}
              title="Готово"
              onPress={handleSave}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: -20,
    padding: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
    width: "100%",
    opacity: 0.7 // Делаем инпут визуально слегка заблокированным
  },
  searchButton: {
    position: "absolute",
    marginRight: 12,
  },
  centerContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 20,
    gap: 16,
  },

  mainPreviewImage: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    resizeMode: "cover",
  },
  descriptionText: {
    textAlign: "center",
  },
  actionButton: {
    width: "100%",
  }
});
