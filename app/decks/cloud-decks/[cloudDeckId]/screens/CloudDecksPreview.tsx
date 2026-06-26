import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View, Image, FlatList } from "react-native";
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
        console.log('данные о колоде', data)
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

  // Компонент для верхней части (хедер, инфо, автор)
  const renderHeader = () => (
    <>
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
            <Typography variant="h2" style={{fontWeight: 700}}>
              {deckPreview?.name}
            </Typography>

            {deckPreview?.description?.trim() && (
              <Typography variant="h3">
                {deckPreview.description}
              </Typography>
            )}

            <View style={styles.deckMeta}>
              <Typography
                style={{fontSize: 10}}
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
                  style={{fontSize: 10}}
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
          {deckPreview?.author?.avatar_url ? (
            <Image
              source={{ uri: deckPreview.author.avatar_url }}
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
              <Typography 
                variant="h3" 
                style={{color: colors.darkGray}}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {deckPreview.author.bio}
              </Typography>
            )}
          </View>
        </View>
      </View>

      {/* Заголовок карточек */}
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
    </>
  );

  // Компонент для пустого состояния
  const renderEmptyComponent = () => (
    <View style={styles.emptyDeck}>
      <Logo size={144} style={{ marginBottom: 16 }} />
      <Typography
        color={colors.darkGray}
        style={{ textAlign: "center" }}
      >
        Пока что колода пуста...
      </Typography>
    </View>
  );

  // Компонент для отсутствия результатов поиска
  const renderEmptySearch = () => (
    <View style={styles.emptyDeck}>
      <Typography
        color={colors.darkGray}
        style={{ textAlign: "center" }}
      >
        По вашему запросу ничего не найдено
      </Typography>
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <View
          style={[
            commonStyles.content,
            { width: "100%", paddingHorizontal: 16, flex: 1 },
          ]}
        >
          <View
            style={[
              commonStyles.mainContent,
              { width: "100%", paddingHorizontal: 0, flex: 1 },
            ]}
          >
            {!hasCards ? (
              <FlatList
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : filteredCards.length === 0 ? (
              <FlatList
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptySearch}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <FlatList
                data={filteredCards}
                renderItem={renderCardItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, gap: 8 }}
                // Отключаем вложенный скролл
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}