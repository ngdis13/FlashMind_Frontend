// app/decks/cloud-decks/card/[cloudCardId].tsx
import { Typography } from "@/styles/Typography";
import { ScrollView, View, Image, Pressable } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { commonStyles } from "@/styles/Common";
import { styles } from "../styles/cloudCardView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { colors } from "@/styles/Colors";
import Toast from "react-native-toast-message";
import { fetchCloudDeckPreview } from "../../api/api";
import { CloudPreviewCard } from "../../types/types";
import { blocksToHtml } from "@/utils/helpers/blocksToHtml";
import { HtmlText } from "@/feature/decks/deck-create-card/components/HtmlText";

export default function CloudCardView() {
  const { cloudCardId, cloudDeckId } = useLocalSearchParams<{
    cloudCardId: string;
    cloudDeckId: string;
  }>();
  const router = useRouter();

  const [card, setCard] = useState<CloudPreviewCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCard = async () => {
      if (!cloudCardId || !cloudDeckId) return;

      try {
        setIsLoading(true);
        // v2.0.0: GET /cloud-cards/{id} удалён — карточка берётся из превью колоды
        // (fetchCloudDeckPreview сначала смотрит в кэш, куда превью уже сохранено)
        const preview = await fetchCloudDeckPreview(cloudDeckId);
        const found = preview.cards?.find((c) => c.id === cloudCardId) ?? null;
        setCard(found);

        if (!found) {
          Toast.show({
            type: "error",
            text1: "Карточка не найдена",
            text2: "Не удалось найти карточку в превью колоды",
            position: "bottom",
          });
        }
      } catch (error) {
        console.error("Ошибка загрузки карточки:", error);
        Toast.show({
          type: "error",
          text1: "Ошибка загрузки",
          text2: "Не удалось загрузить карточку",
          position: "bottom",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCard();
  }, [cloudCardId, cloudDeckId]);

  const handleBack = () => {
    router.push(`/decks/cloud-decks/${cloudDeckId}`);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    );
  }

  const frontHtml = blocksToHtml(card?.front);
  const backHtml = blocksToHtml(card?.back);

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
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Хедер */}
          <View style={styles.header}>
            <Pressable onPress={handleBack}>
              <Image
                source={ReturnIcon}
                style={{ width: 12, height: 22 }}
              />
            </Pressable>

            <Typography variant="h1" style={{ marginBottom: 0 }}>
              Вернуться к колоде
            </Typography>
          </View>

          {/* Контент карточки */}
          <View
            style={[
              commonStyles.infoBox,
              { flexDirection: "column", width: "100%" },
            ]}
          >
            {/* НАЗВАНИЕ */}
            {card?.title ? (
              <View style={styles.inputWrapper}>
                <Typography variant="h3" style={styles.firstHeader}>
                  название
                </Typography>
                <View style={styles.valueContainer}>
                  <Typography variant="h2">{card.title}</Typography>
                </View>
              </View>
            ) : null}

            {/* ТЕРМИН */}
            <View style={styles.inputWrapper}>
              <Typography variant="h3" style={styles.firstHeader}>
                термин
              </Typography>
              <View style={styles.valueContainer}>
                {frontHtml ? (
                  <HtmlText html={frontHtml} fontSize={18} />
                ) : (
                  <Typography variant="h2">Нет данных</Typography>
                )}
              </View>
            </View>

            {/* ОПРЕДЕЛЕНИЕ */}
            <View style={styles.inputWrapper}>
              <Typography variant="h3" style={styles.firstHeader}>
                определение
              </Typography>
              <View style={styles.valueContainer}>
                {backHtml ? (
                  <HtmlText html={backHtml} fontSize={18} />
                ) : (
                  <Typography variant="h2">Нет данных</Typography>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
