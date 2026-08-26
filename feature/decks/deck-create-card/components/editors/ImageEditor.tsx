// feature-decks/deck-create-card/components/editors/ImageEditor.tsx
import { ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { useCardStore } from "@/store/card.store";
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { Logo } from "@/components/Logo";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";

export const ImageEditor = () => {
  const router = useRouter();
  const { id, side, blockId } = useLocalSearchParams<{
    id: string;
    side: string;
    blockId: string;
  }>();

  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);

  const sideKey: "front" | "back" = side === "front" ? "front" : "back";
  const block = (sideKey === "front" ? front : back).find(
    (b) => b.id === blockId,
  );

  // Контролируем наличие картинки напрямую из хранилища карточки
  const currentImageUrl = block && block.type === "image" ? block.url : "";

  const [imageAspectRatio, setImageAspectRatio] = useState<number>(16 / 9);

  // Считываем реальные размеры картинки пользователя, чтобы красиво вписать её в UI
  useEffect(() => {
    if (currentImageUrl) {
      Image.getSize(
        currentImageUrl,
        (width, height) => {
          setImageAspectRatio(width / height);
        },
        (err) =>
          console.error(
            "Ошибка чтения размеров сохраненного превью",
            err,
          ),
      );
    }
  }, [currentImageUrl]);

  const handleBack = (): void => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: { side },
    });
  };

  const handleGoToSearch = (): void => {
    router.push({
      pathname: `/decks/${id}/create-card/image-search`,
      params: { id, side, blockId },
    });
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
        >
          {/* Шапка: Всегда статичный заголовок "Изображение" */}
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

          {/* Интерактивный контент */}
          <View style={styles.centerContent}>
            {currentImageUrl ? (
              /* Показываем РЕАЛЬНОЕ вставленное изображение пользователя */
              <Image
                source={{ uri: currentImageUrl }}
                style={[
                  styles.mainPreviewImage,
                  { aspectRatio: imageAspectRatio },
                ]}
              />
            ) : (
              /* Показываем пустую дефолтную заглушку со звездочкой */
              <>
                <Logo size={143} />
                <Typography
                  variant="h2"
                  color={colors.darkGray}
                  style={styles.descriptionText}
                >
                  Здесь будет ваше изображение
                </Typography>
              </>
            )}
          </View>
        </ScrollView>

        {/* Зона нижних кнопок действий */}
        <View style={styles.bottomContainer}>
          {currentImageUrl ? (
            <>
              {/* Состояние: Картинка добавлена */}
              <SecondButton
                style={styles.actionButton}
                title="Изменить фото"
                onPress={handleGoToSearch}
              />
              <MainButton
                style={styles.actionButton}
                title="Готово"
                onPress={handleBack}
              />
            </>
          ) : (
            /* Состояние: Блок пустой */
            <MainButton
              style={styles.actionButton}
              title="Добавить изображение"
              onPress={handleGoToSearch}
            />
          )}
        </View>
      </View>
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
  descriptionText: { textAlign: "center", marginTop: 8 },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: BOTTOM_MARGIN,
    gap: 10,
  },
  actionButton: { width: "100%" },
});
