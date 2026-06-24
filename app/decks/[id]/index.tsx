import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Image, Pressable } from "react-native";
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
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";
import InfoIcon from "@/feature-decks/assets/infoIcon.png";
import ImportButton from "@/feature-decks/assets/importButton.png";
// 1. Импортируем ваш кастомный алерт
import { CustomAlert } from "@/components/CustomAlert";
import { ShareDeckModal } from "../components/ShareDeckModal";

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { decks, getDeckCards, removeCard } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  // 2. Стейты для управления кастомным алертом
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    icon?: React.ReactNode;
  }>({
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
  });

  const deck = decks.find((d) => d.id === id);
  const showCloudAlert = deck?.cloud_info?.needs_sync === true;

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  // Обработчик нажатия на кнопку импорта/поделиться
  const handleShareDeck = () => {
    setIsShareModalVisible(true);
  };

  // Функция копирования ссылки в буфер обмена
  const handleCopyLink = () => {
    // Например: Clipboard.setString(`https://yourapp.com{id}`);
    Toast.show({
      type: "success",
      text1: "Ссылка скопирована в буфер обмена",
      position: "bottom",
    });
  };

  // Функция отправки запроса на публикацию колоды
  const handleMakePublic = async () => {
    // Тут ваш запрос к API, например:
    // await axios.post(`/decks/${id}/public`);
    console.log("Колода отправлена на публикацию");
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

  // 3. Логика для алерта СИНХРОНИЗАЦИИ (красный значок)
  const handleCloudSyncAlert = () => {
    setAlertConfig({
      message:
        "Доступна новая версия колоды в облаке. Синхронизировать изменения?",
      confirmText: "Синхронизировать",
      cancelText: "Отмена",
      icon: <Logo size={64} />, // Можете заменить на любую иконку/звездочку
      onConfirm: async () => {
        try {
          setIsAlertVisible(false);
          // Тут в будущем вызовите ваш метод синхронизации, например:
          // await syncDeckWithCloud(id);
          Toast.show({
            type: "success",
            text1: "Колода успешно обновлена",
            position: "bottom",
            visibilityTime: 3000,
          });
        } catch (error) {
          console.error(error);
        }
      },
    });
    setIsAlertVisible(true);
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
                      style={{ width: 12, height: 22 }}
                    />
                  </Pressable>

                  <Typography variant="h1" style={{ marginBottom: 0 }}>
                    Вернуться к колодам
                  </Typography>
                </View>

                <View style={styles.noticeBox}>
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

                  <Pressable onPress={handleShareDeck}>
                    <Image
                      source={ImportButton}
                      style={styles.importButton}
                    />
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

      {/* Алерт для красного уведомления о синхронизации */}
      <CustomAlert 
        visible={isAlertVisible}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setIsAlertVisible(false)}
        icon={alertConfig.icon}
      />

      {/* Модал шаринга/публикации колоды */}
      <ShareDeckModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        onCopyLink={handleCopyLink}
        onMakePublic={handleMakePublic}
      />
    </View>
  );

}
