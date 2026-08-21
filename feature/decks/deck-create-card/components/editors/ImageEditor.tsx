// feature-decks/deck-create-card/components/editors/ImageEditor.tsx
import { ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { useCardStore } from "@/store/card.store";
import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import searchButton from "@/feature-decks/assets/searchButton.png";

// Импортируем наш поп-ап формата обрезки
import { ImageCropModal } from "../ImageCropModal";

export const ImageEditor = () => {
  const router = useRouter();
  const { id, side, blockId } = useLocalSearchParams<{
    id: string;
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

  // Достаем сохраненный url из Zustand-стора
  const initialUrl = block && block.type === "image" ? block.url : "";

  // Финальный обрезанный путь картинки для вывода на экран и сохранения
  const [localUrl, setLocalUrl] = useState<string>(initialUrl || "");
  const [searchText, setSearchText] = useState("");

  // Стейт для динамических пропорций превью картинки на экране (дефолт 16:9)
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(16 / 9);

  // Промежуточные стейты для управления поп-апом формата
  const [tempUrl, setTempUrl] = useState<string>("");
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);

  // Следим за изменением картинки и считываем её реальные пропорции, чтобы перестроить тег <Image>
  useEffect(() => {
    if (localUrl) {
      Image.getSize(
        localUrl,
        (width, height) => {
          setImageAspectRatio(width / height); // Например, 0.75 для 3:4 или 1.33 для 4:3
        },
        (err) => console.error("Ошибка чтения размеров превью", err),
      );
    }
  }, [localUrl]);

  const handleBack = (): void => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: { side },
    });
  };

  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // 2. Полностью замени функцию handlePickImage на эту:
  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Приложению нужен доступ к галерее, чтобы загрузить фото.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      // Записываем размеры, которые НАМ УЖЕ ДАЛА галерея!
      setOrigWidth(asset.width);
      setOrigHeight(asset.height);
      setTempUrl(asset.uri);
      setIsCropModalVisible(true); // Включаем поп-ап, теперь он откроется мгновенно!
    }
  };

  // Срабатывает, когда пользователь настроил формат в поп-апе и нажал "Подтвердить"
  const handleConfirmCroppedImage = (croppedUri: string) => {
    setLocalUrl(croppedUri); // Готовую отцентрированную картинку переносим на экран
    setIsCropModalVisible(false); // Скрываем поп-ап
    setTempUrl("");
  };

  // Сохраняем данные в Zustand при нажатии нижней кнопки "Готово"
  const handleSave = (): void => {
    updateDraftBlockValue(sideKey, blockId, localUrl);
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: { side },
    });
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 20,
            paddingBottom: 30,
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Шапка */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={20}
            >
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

          {/* Контент по центру */}
          <View style={styles.centerContent}>
            {localUrl ? (
              <Image
                source={{ uri: localUrl }}
                // Применяем динамическое соотношение сторон прямо в массив стилей!
                style={[
                  styles.mainPreviewImage,
                  { aspectRatio: imageAspectRatio },
                ]}
              />
            ) : (
              <>
                <Logo size={143} />
                <Typography
                  variant="h2"
                  color={colors.darkGray}
                  style={styles.descriptionText}
                >
                  Напишите любое слово, и мы вместе подберем классное
                  изображение из сети
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
            gap: 10,
          }}
        >
          {/* Кнопка Галереи */}
          <MainButton
            style={styles.actionButton}
            title={localUrl ? "Изменить фото" : "Добавить из галереи"}
            onPress={handlePickImage}
          />

          {/* Кнопка "Готово" подтверждает сохранение в стор */}
          {localUrl ? (
            <MainButton
              style={[
                styles.actionButton,
                { backgroundColor: colors.mainColor },
              ]}
              title="Готово"
              onPress={handleSave}
            />
          ) : null}
        </View>
      </View>

      {/* ПОП-АП ФОРМАТА И АВТОМАТИЧЕСКОГО КРОПА ПО ЦЕНТРУ */}
      <ImageCropModal
        isVisible={isCropModalVisible}
        imageUri={tempUrl}
        origWidth={origWidth}
        origHeight={origHeight}
        onClose={() => {
          setIsCropModalVisible(false);
          setTempUrl("");
        }}
        onConfirm={handleConfirmCroppedImage}
      />
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
    opacity: 0.7,
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
    paddingHorizontal: 20,
    gap: 16,
  },
  mainPreviewImage: {
    width: "100%",
    borderRadius: 20,
    resizeMode: "cover",
    backgroundColor: "#F2F2F7",
  },
  descriptionText: {
    textAlign: "center",
  },
  actionButton: {
    width: "100%",
  },
});
