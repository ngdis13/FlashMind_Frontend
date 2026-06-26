import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View, Image, FlatList } from "react-native";
import { fetchCloudDeckPreview } from "../../api/api";
import { CloudDeckPreviewResponse } from "../../types/types";
import { Typography } from "@/styles/Typography";
import { commonStyles } from "@/styles/Common";
import { colors } from "@/styles/Colors";
import { styles } from "../styles/styles";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { getDaysAgoText } from "@/utils/helpers/getDayAgo";
import IconDownloadPreview from "../../assets/IconDownloadPreview.png";
import { formatDownloadsCount } from "@/utils/helpers/formatDownloadsCount";
import { UserAvatar } from "@/feature-profile/assets/UserAvatar";
import { Input } from "@/components/Input";
import searchButton from "@/feature/decks/assets/searchButton.png";
import { Logo } from "@/components/Logo";

//flashmind.ru/c60a21c7-13c6-41de-a273-ff46ed24092f
export default function CloudDecksPreview() {
  const router = useRouter();
  const { cloudDeckId } = useLocalSearchParams<{ cloudDeckId: string }>();
  const [search, setSearch] = useState("");

  const [deckPreview, setDeckPreview] =
    useState<CloudDeckPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!cloudDeckId) return;

      try {
        setIsLoading(true);
        const data = await fetchCloudDeckPreview(cloudDeckId);
        setDeckPreview(data);
      } catch (error) {
        console.error("Ошибка при загрузке превью с сервера:", error);
        Toast.show({
          type: "error",
          text1: "Ошибка загрузки",
          text2: "Не удалось получить данные колоды с сервера",
          position: "bottom",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    console.log('аватарка', deckPreview?.author.avatar_key)
  }, [cloudDeckId]);

  const handleBack = () => {
    router.push("/decks/cloud-decks");
  };

  const updatedTime = getDaysAgoText(deckPreview?.last_synced_at ?? "");
  const formattedDownloads = formatDownloadsCount(deckPreview?.downloaded);
  const authorFullName =
    `${deckPreview?.author.first_name} ${deckPreview?.author.last_name}`.trim() ||
    "Пользователь FlashMind";
  const hasCards = deckPreview?.total_cards > 0;

  const filteredCards =
    deckPreview?.cards?.filter((card) =>
      card.front.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  const handleCardPress = (cardId: string) => {
    // Переход на детальный просмотр карточки
    //router.push(`/decks/cloud-decks/preview/card/${cardId}`);
    console.log("переход к карточке", cardId);
  };
  // Компонент для отрисовки одной карточки
  const renderCardItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleCardPress(item.id)}>
      <View style={[commonStyles.mainBox, styles.cardItem]}>
        <Typography variant="h2" style={styles.cardText}>
          {item.front}
        </Typography>
      </View>
    </Pressable>
  );
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
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
              {/* Хедер */}
              <View style={[commonStyles.header, styles.header]}>
                <View style={styles.headerName}>
                  <Pressable onPress={handleBack}>
                    <Image
                      source={ReturnIcon}
                      style={{ width: 12, height: 22 }}
                    />
                  </Pressable>

                  <Typography variant="h1" style={{ marginBottom: 0 }}>
                    Вернуться к колодам
                  </Typography>
                </View>
              </View>

              {/* Информация о колоде */}
              <View style={[commonStyles.mainBox, styles.deckCard]}>
                <View style={styles.deckCardContent}>
                  <View style={styles.purpleLine} />

                  <View style={styles.deckInfo}>
                    <Typography variant="h2" style={styles.deckTitle}>
                      {deckPreview?.name}
                    </Typography>

                    {deckPreview?.description?.trim() && (
                      <Typography variant="h3" style={styles.deckDescription}>
                        {deckPreview.description}
                      </Typography>
                    )}

                    <View style={styles.deckMeta}>
                      <Typography
                        style={styles.metaText}
                        color={colors.darkGray}
                      >
                        Обновлено: {updatedTime}
                      </Typography>

                      <View style={styles.downloadBox}>
                        <Image
                          source={IconDownloadPreview}
                          style={{ width: 8, height: 10 }}
                        />
                        <Typography
                          style={styles.metaText}
                          color={colors.mainColor}
                        >
                          {formattedDownloads}
                        </Typography>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Секция "Об авторе" */}
              <View style={styles.authorSection}>
                <View style={styles.authorHeader}>
                  <Typography variant="h2">Об авторе</Typography>
                </View>
                <View style={[commonStyles.mainBox, styles.authorBio]}>
                  {deckPreview?.author?.avatar_key ? (
                    <Image
                      source={{ uri: deckPreview.author.avatar_key }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <UserAvatar size={60} />
                  )}

                  <View style={styles.authorBioBox}>
                    <Typography variant="h2">
                      {authorFullName}
                    </Typography>
                    {deckPreview?.author?.bio && (
                      <Typography variant="h3" style={{color: colors.darkGray}}>
                        {deckPreview.author.bio}
                      </Typography>
                    )}
                  </View>
                </View>
              </View>

              {/* Секция карточек */}
              <View style={styles.cardsSection}>
                <View style={styles.cardsHeader}>
                  <Typography variant="h2">
                    Карточки ({deckPreview?.total_cards || 0})
                  </Typography>
                </View>

                {/* Поиск */}
                <View style={styles.searchBox}>
                  <View style={{ flex: 1, width: "100%" }}>
                    <Input
                      style={{ textAlign: "left", width: "100%" }}
                      placeholder={"Поиск"}
                      value={search}
                      onChangeText={setSearch}
                    />
                  </View>
                  <View style={styles.searchButton}>
                    <Image
                      source={searchButton}
                      style={{ width: 18, height: 18 }}
                    />
                  </View>
                </View>

                {/* Список карточек или пустое состояние */}
                {!hasCards ? (
                  <View style={styles.emptyDeck}>
                    <Logo size={144} style={{ marginBottom: 16 }} />
                    <Typography
                      color={colors.darkGray}
                      style={{ textAlign: "center" }}
                    >
                      Пока что колода пуста...
                    </Typography>
                  </View>
                ) : filteredCards.length === 0 ? (
                  <View style={styles.emptyDeck}>
                    <Typography
                      color={colors.darkGray}
                      style={{ textAlign: "center" }}
                    >
                      По вашему запросу ничего не найдено
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.cardsList}>
                    <FlatList
                      data={filteredCards}
                      renderItem={renderCardItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      contentContainerStyle={{ gap: 8 }}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
