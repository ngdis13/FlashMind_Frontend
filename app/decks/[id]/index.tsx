import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Image, Pressable, Platform } from "react-native";
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
import { ShareDeckModal } from "../components/ShareDeckModal";
import * as Clipboard from "expo-clipboard";
import { SyncDeckModal } from "../components/SyncDeckModal";

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { decks, getDeckCards, removeCard, makeDeckPublic } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);


  const deck = decks.find((d) => d.id === id);
  const showCloudAlert = deck?.cloud_info?.needs_sync === true;

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  // Стейт для мгновенного сохранения UUID, полученного от сервера
  const [cachedCloudUuid, setCachedCloudUuid] = useState<string | null>(null);

  // 1. ОБНОВЛЕННЫЙ ОБРАБОТЧИК: Нажатие на кнопку импорта/поделиться в шапке
  const handleShareDeck = async () => {
    const existingCloudId = deck?.cloud_info?.cloud_deck_id;

    // Если у колоды уже есть облачный ID, просто сразу открываем модалку
    if (existingCloudId) {
      setCachedCloudUuid(existingCloudId);
      setIsShareModalVisible(true);
      return;
    }

    // Если колода была чисто локальной, автоматически превращаем её в приватную облачную при открытии
    if (id) {
      try {
        Toast.show({
          type: "info",
          text1: "Генерация ссылки доступа...",
          position: "bottom",
        });

        // Дергаем ваш метод из хука, который отправляет POST на /share
        // По умолчанию бэкенд сделает её PRIVATE, сгенерирует UUID и вернет его
        const response = await makeDeckPublic(id);

        if (response && response.cloud_uid) {
          setCachedCloudUuid(response.cloud_uid); // Сохраняем сгенерированный сервером UUID
          setIsShareModalVisible(true); // Открываем модалку, где ссылка уже будет работать!
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Не удалось создать ссылку",
          text2: "Проверьте подключение к сети или Nginx",
          position: "bottom",
        });
      }
    }
  };

  const handleCopyLink = async () => {
    console.log("🔍 cachedCloudUuid:", cachedCloudUuid);
    console.log(
      "🔍 deck?.cloud_info?.cloud_deck_id:",
      deck?.cloud_info?.cloud_deck_id,
    );

    const cloudUuid = cachedCloudUuid || deck?.cloud_info?.cloud_deck_id;
    console.log("🔍 Итоговый cloudUuid:", cloudUuid);

    if (!cloudUuid) {
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Ссылка еще не сгенерирована сервером",
        position: "bottom",
      });
      return;
    }

    const shareUrl = `https://flashmind.ru/${cloudUuid}`;

    try {
      // Проверяем: если приложение запущено в БРАУЗЕРЕ (Web)
      if (Platform.OS === "web") {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          // Старый резервный метод для совсем вредных браузеров
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
      } else {
        // Если запущено на мобилке (iOS / Android)
        await Clipboard.setStringAsync(shareUrl);
      }

      Toast.show({
        type: "success",
        text1: "Ссылка скопирована в буфер обмена",
        text2: shareUrl, // Показываем какую ссылку скопировали (для отладки)
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Ошибка при записи в буфер обмена:", error);
      Toast.show({
        type: "error",
        text1: "Не удалось скопировать",
        text2: "Попробуйте вручную",
        position: "bottom",
      });
    }
  };

  // 3. ФУНКЦИЯ: Сделать публичной (кнопка внутри модалки)
  const handleMakePublic = async () => {
    if (!id) return false;
    try {
      Toast.show({
        type: "info",
        text1: "Отправка на модерацию...",
        position: "bottom",
      });

      await makeDeckPublic(id);

      Toast.show({
        type: "success",
        text1: "Колода успешно отправлена в каталог",
        position: "bottom",
      });

      return true;
    } catch (error) {
      return false;
    }
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

  // Добавляем стейт видимости модалки синхронизации
  const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);

  // Определяем, является ли текущий пользователь автором этой облачной колоды
  const isUserAuthor = deck?.cloud_info?.is_author === true;

  // 2. Функция, которая открывает новый модал при клике на КРАСНОЕ уведомление (InfoIcon)
  const handleCloudSyncAlert = () => {
    setIsSyncModalVisible(true);
  };

  // 3. Логика выполнения синхронизации при нажатии на синюю кнопку в модалке
  const handleSyncConfirm = async () => {
    try {
      setIsSyncModalVisible(false);

      Toast.show({
        type: "info",
        text1: "Синхронизация данных...",
        position: "bottom",
      });

      // Тут будет ваш запрос к API на обновление/получение изменений, например:
      // await syncDeckCardsData(id);

      Toast.show({
        type: "success",
        text1: "Колода успешно синхронизирована!",
        position: "bottom",
      });
    } catch (error) {
      console.error("Ошибка синхронизации:", error);
    }
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

      {/* Алерт для красного уведомления о синхронизации */}
      <SyncDeckModal
        visible={isSyncModalVisible}
        onClose={() => setIsSyncModalVisible(false)}
        onSync={handleSyncConfirm}
        type={isUserAuthor ? "user_updated" : "author_updated"}
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
