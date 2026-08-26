// feature-decks/deck-create-card/components/editors/ImageSearchEditor.tsx
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
import { Logo } from "@/components/Logo";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import searchButton from "@/feature-decks/assets/searchButton.png";
import { ImageCropModal } from "../ImageCropModal";

export const ImageSearchEditor = () => {
  const router = useRouter();
  const { id, side, blockId } = useLocalSearchParams<{
    id: string;
    side: string;
    blockId: string;
  }>();

  const updateDraftBlockValue = useCardStore((s) => s.updateDraftBlockValue);
  const sideKey: "front" | "back" = side === "front" ? "front" : "back";

  const [searchText, setSearchText] = useState("");
  const [tempUrl, setTempUrl] = useState<string>("");
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  const handleBack = (): void => {
    router.back();
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
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
      setOrigWidth(asset.width);
      setOrigHeight(asset.height);
      setTempUrl(asset.uri);
      setIsCropModalVisible(true);
    }
  };

  const handleConfirmCroppedImage = (croppedUri: string) => {
    // Сохраняем готовую вырезанную фотку в стор приложения
    updateDraftBlockValue(sideKey, blockId, croppedUri);
    setIsCropModalVisible(false);
    setTempUrl("");
    // Возвращаемся назад на экран предпросмотра, где картинка мгновенно обновится
    router.back();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Шапка: Измененный заголовок "Добавить изображение" */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={20}
            >
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Добавить изображение</Typography>
          </View>

          {/* Строка поиска картинок из сети */}
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

          {/* Центральная информационная часть */}
          <View style={styles.centerContent}>
            <Logo size={143} />
            <Typography
              variant="h2"
              color={colors.darkGray}
              style={styles.descriptionText}
            >
              Напишите любое слово, и мы вместе подберем классное изображение
              из сети
            </Typography>
          </View>
        </ScrollView>

        {/* Нижняя кнопка вызова нативной галереи */}
        <View style={styles.bottomContainer}>
          <MainButton
            style={styles.actionButton}
            title="Добавить из галереи"
            onPress={handlePickImage}
          />
        </View>
      </View>

      {/* Модальное окно автокроппера */}
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
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: { position: "absolute", left: -20, padding: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
    width: "100%",
    opacity: 0.7,
  },
  searchButton: { position: "absolute", marginRight: 12 },
  centerContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 40,
  },
  descriptionText: { textAlign: "center" },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: BOTTOM_MARGIN,
  },
  actionButton: { width: "100%" },
});