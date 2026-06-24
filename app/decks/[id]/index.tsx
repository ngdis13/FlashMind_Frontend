import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Image, Pressable, FlatList } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { styles } from "../styles/deckViewById.style";
import { Input } from "@/components/Input";
import { useCallback, useEffect, useState, useMemo } from "react";
import { SettingsIcon } from "@/feature/profile/assets/SettingsIcon";
import PlusIcon from "@/assets/icons/PlusIcon.png";
import searchButton from "@/feature/decks/assets/searchButton.png";
import { colors } from "@/styles/Colors";
import { Logo } from "@/components/Logo";
import { useDecks } from "@/storage/hooks/useDecks";
import { CardItem } from "../components/CardItem";
import { Card } from "@/storage/types/types";
import { ColorPalette } from "@/app/create-decks/components/colorPalette";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";
import InfoIcon from "@/feature-decks/assets/infoIcon.png";
import ImportButton from "@/feature-decks/assets/importButton.png";

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { decks, getDeckCards, removeCard } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  const deck = decks.find((d) => d.id === id);

  //проверка на возможность синнхронизации
  const showCloudAlert = deck?.cloud_info?.needs_sync === true;

  const handleCloudSyncAlert = () => {
    console.log("Открыть кастомный alert для синхронизации колоды:", id);
  };

  const handleShareDeck = () => {
    console.log("Поделиться колодой или экспорт:", id);
  };

  const handleBack = () => {
    router.push("/decks");
  };
  const handleSettings = () => {
    router.push(`/decks/${id}/settings`);
  };
  const handleAddCard = () => {
    router.push(`/decks/${id}/create-card?deckId=${id}`);
  };

  const loadCards = async () => {
    try {
      const fetchedCards = await getDeckCards(id as string);
      setCards(fetchedCards);
    } catch (error) {
      console.error("Ошибка загрузки карточек:", error);
    }
  };

  const handleCardPress = (cardId: string) => {
    router.push(`/card/${cardId}?deckId=${id}`);
  };

  const handleDeleteCard = async (cardId: string, deckId?: string) => {
    try {
      await removeCard(deckId || (id as string), cardId);
      setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));

      Toast.show({
        type: "success",
        text1: "Карточка удалена",
        position: "bottom",
        visibilityTime: 3000,
      });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const serverMessage =
        err.response?.data?.message || err?.message || "Попробуйте снова";

      Toast.show({
        type: "error",
        text1: "Ошибка удаления карточки",
        text2: serverMessage,
        position: "bottom",
        visibilityTime: 3000,
      });

      console.error("Ошибка при удалении карточки:", error);
    }
  };

  // ФИЛЬТРАЦИЯ (Логика поиска)
  const filteredCards = useMemo(() => {
    return cards.filter((card) =>
      card.front.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, cards]);

  useEffect(() => {
    if (id) {
      loadCards();
    }
    console.log("Карточки");
    console.log(cards);
  }, [id]);

  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
  }, [deck]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadCards();
      }
    }, [id]),
  );

  const hasCards = cards.length > 0;

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
              <View style={[commonStyles.header, styles.header]}>
                <View style={styles.headerName}>
                  <Pressable onPress={handleBack}>
                    <Image
                      source={ReturnIcon}
                      style={{ width: 12, height: 22, top: -7 }}
                    />
                  </Pressable>

                  <Typography variant="h1" style={{ marginBottom: 16 }}>
                    Вернуться к колодам
                  </Typography>
                </View>

                <View style={styles.noticeBox}>
                  {/* Уведомление рендерится абсолютно СЛЕВА от импорта и никак на него не влияет */}
                  {showCloudAlert && (
                    <Pressable
                      onPress={handleCloudSyncAlert}
                      style={styles.cloudAlertAbsoluteLeft}
                    >
                      <Image
                        source={InfoIcon}
                        style={{ width: 24, height: 24 }}
                      />
                    </Pressable>
                  )}

                  {/* Кнопка импорта — это статичный центр noticeBox, она всегда на одном месте */}
                  <Pressable onPress={handleShareDeck}>
                    <Image source={ImportButton} style={styles.importButton} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.mainInfo}>
                <View
                  style={[commonStyles.mainBox, { width: "100%" }, styles.info]}
                >
                  <View style={styles.purpleLine} />

                  <View style={styles.textContainer}>
                    <Typography variant="h2" style={{ fontWeight: 800 }}>
                      {name}
                    </Typography>
                    {description.trim() !== "" && (
                      <Typography variant="h2">{description}</Typography>
                    )}
                  </View>
                </View>

                <Pressable
                  style={[commonStyles.mainBox, styles.settingsButton]}
                  onPress={handleSettings}
                >
                  <SettingsIcon />
                  <Typography variant="h2">Настройки</Typography>
                </Pressable>
              </View>

              <View style={styles.cards}>
                <View style={styles.cardsHeader}>
                  <Typography variant="h2">Карточки</Typography>
                  <Pressable onPress={handleAddCard}>
                    <Image
                      source={PlusIcon}
                      style={{ width: 16, height: 16 }}
                    />
                  </Pressable>
                </View>

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
                ) : (
                  <View style={{ gap: 16, paddingVertical: 8, width: "100%" }}>
                    {filteredCards.length > 0 ? (
                      filteredCards.map((item, index) => (
                        <CardItem
                          key={item.id}
                          id={item.id}
                          front={item.front}
                          back={item.back}
                          deckId={id}
                          difficulty={item.difficulty}
                          index={index}
                          viewMode="compact"
                          onPress={handleCardPress}
                          onDelete={handleDeleteCard}
                        />
                      ))
                    ) : (
                      <Typography
                        style={{ textAlign: "center", marginTop: 12 }}
                      >
                        Ничего не найдено :(
                      </Typography>
                    )}
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
