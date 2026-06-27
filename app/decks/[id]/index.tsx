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

  const { decks, getDeckCards, removeCard, makeDeckPublic, importDeck } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  const deck = decks.find((d) => d.id === id);
  const showCloudAlert = deck?.cloud_info?.needs_sync === true;

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  // Стейт для мгновенного сохранения UUID, полученного от сервера
  const [cachedCloudUuid, setCachedCloudUuid] = useState<string | null>(null);

  useEffect(() => {
    const generateLinkOnLoad = async () => {
      if (!id) return;

      // Проверяем, есть ли уже cloud_deck_id
      const existingCloudId = deck?.cloud_info?.cloud_deck_id;

      // Если уже есть - сохраняем в кеш
      if (existingCloudId) {
        setCachedCloudUuid(existingCloudId);
        console.log("✅ Ссылка уже существует:", existingCloudId);
        return;
      }

      // Если колода локальная - создаём ссылку автоматически
      const isCloudDeck = deck?.cloud_info?.is_cloud_deck === true;
      if (!isCloudDeck && id) {
        try {
          console.log(
            "🔄 Автоматическая генерация ссылки при открытии колоды...",
          );
          const response = await makeDeckPublic(id);

          if (response?.cloud_uid) {
            setCachedCloudUuid(response.cloud_uid);
            console.log(
              "✅ Ссылка сгенерирована автоматически:",
              response.cloud_uid,
            );
          }
        } catch (error) {
          console.error("❌ Не удалось автоматически создать ссылку:", error);
        }
      }
    };

    generateLinkOnLoad();
  }, [id, deck?.cloud_info?.cloud_deck_id, deck?.cloud_info?.is_cloud_deck]);

  // ГЛАВНЫЙ ОБРАБОТЧИК: Нажатие на иконку шеринга в шапке
  const handleSharePress = async () => {
    // 1. Достаем актуальные флаги из cloud_info текущей колоды
    const isCloudDeck = deck?.cloud_info?.is_cloud_deck === true;
    const needsSync = deck?.cloud_info?.needs_sync === true;
    const existingCloudId = deck?.cloud_info?.cloud_deck_id;

    // === СЦЕНАРИЙ 1: Колода ОБЛАЧНАЯ и НЕ НУЖНА синхронизация ===
    if (isCloudDeck && !needsSync) {
      console.log(
        "Сценарий 1: Колода в облаке, синхра не нужна. Берём готовый ID.",
      );
      if (existingCloudId) {
        setCachedCloudUuid(existingCloudId);
      }
      setIsShareModalVisible(true);
      return;
    }

    // === СЦЕНАРИЙ 2 и 3: Колода либо ЛОКАЛЬНАЯ, либо ОБЛАЧНАЯ, но НУЖНА синхронизация ===
    if (id) {
      try {
        Toast.show({
          type: "info",
          text1: !isCloudDeck
            ? "Генерация ссылки доступа..."
            : "Синхронизация с облаком...",
          position: "bottom",
        });

        const response = await makeDeckPublic(id);

        const cloudUuid =
          response?.cloud_uid || (response as any)?.data?.cloud_uid;

        if (cloudUuid) {
          setCachedCloudUuid(cloudUuid);
          setIsShareModalVisible(true);

          Toast.show({
            type: "success",
            text1: !isCloudDeck
              ? "Ссылка успешно создана"
              : "Данные синхронизированы",
            position: "bottom",
            visibilityTime: 1500,
          });
        } else {
          throw new Error("Сервер не вернул cloud_uid");
        }
      } catch (error) {
        console.error("Ошибка в handleSharePress:", error);
        Toast.show({
          type: "error",
          text1: "Ошибка соединения",
          text2: "Не удалось связаться с сервером",
          position: "bottom",
        });
      }
    }
  };

  const handleCopyLink = async () => {
    // Сначала проверяем кеш, потом cloud_info
    const cloudUuid = cachedCloudUuid || deck?.cloud_info?.cloud_deck_id;

    console.log("🔍 Копирование: cachedCloudUuid =", cachedCloudUuid);
    console.log(
      "🔍 Копирование: deck.cloud_info.cloud_deck_id =",
      deck?.cloud_info?.cloud_deck_id,
    );
    console.log("🔍 Итоговый cloudUuid:", cloudUuid);

    if (!cloudUuid) {
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Ссылка еще не сгенерирована",
        position: "bottom",
      });
      return;
    }

    const shareUrl = `https://flashmind.ru/decks/cloud-decks/${cloudUuid}`;
    console.log("Копируем ссылку:", shareUrl);

    try {
      let copySuccess = false;

      if (Platform.OS === "web") {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          copySuccess = true;
          console.log("Скопировано через navigator.clipboard");
        } else {
          // Fallback для небезопасных контекстов (HTTP)
          console.warn(
            "⚠️ navigator.clipboard недоступен, используем fallback",
          );

          // Создаем временный input
          const textArea = document.createElement("input");
          textArea.value = shareUrl;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "-9999px";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);

          textArea.select();
          textArea.setSelectionRange(0, 99999);

          try {
            const successful = document.execCommand("copy");
            if (successful) {
              copySuccess = true;
              console.log("Скопировано через execCommand");
            }
          } catch (err) {
            console.error("execCommand failed:", err);
          }

          document.body.removeChild(textArea);
        }
      } else {
        // Мобильные платформы
        await Clipboard.setStringAsync(shareUrl);
        copySuccess = true;
        console.log("Скопировано через expo-clipboard");
      }

      if (copySuccess) {
        Toast.show({
          type: "success",
          text1: "Ссылка скопирована!",
          text2: shareUrl,
          position: "bottom",
          visibilityTime: 3000,
        });
      } else {
        throw new Error("Не удалось скопировать");
      }
    } catch (error) {
      console.error("Ошибка при копировании:", error);

      // Показываем ссылку для ручного копирования
      Toast.show({
        type: "info",
        text1: "Ссылка для копирования",
        text2: shareUrl,
        position: "bottom",
        visibilityTime: 5000,
      });
    }
  };

  // Функция: Сделать публичной (кнопка внутри модалки)
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
      console.error("Ошибка публикации:", error);
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

  const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
  const isUserAuthor = deck?.cloud_info?.is_author === true;

  const handleCloudSyncAlert = () => {
    setIsSyncModalVisible(true);
  };

  const handleSync = async () => {
    if (!id) return false;

    try {
      const isAuthor = deck?.cloud_info?.is_author === true;
      const isCloudDeck = deck?.cloud_info?.is_cloud_deck === true;
      const cloudDeckId = deck?.cloud_info?.cloud_deck_id;

      // Если это авторская колода или локальная - используем share
      if (isAuthor || !isCloudDeck) {
        console.log("Синхронизация через /share (АВТОР)");
        Toast.show({
          type: "info",
          text1: "Публикация изменений...",
          position: "bottom",
        });

        await makeDeckPublic(id);

        Toast.show({
          type: "success",
          text1: "Изменения опубликованы",
          position: "bottom",
        });
      } else {
        // Если это колода другого пользователя - используем import
        console.log("Синхронизация через /import (ПОЛЬЗОВАТЕЛЬ)");
        Toast.show({
          type: "info",
          text1: "Загрузка обновлений...",
          position: "bottom",
        });

        // Импортируем актуальную версию колоды
        const importedDeck = await importDeck(id);

        // Обновляем локальные карточки
        if (importedDeck.cards) {
          setCards(importedDeck.cards);
        }

        Toast.show({
          type: "success",
          text1: "Колода обновлена",
          position: "bottom",
        });
      }

      // Перезагружаем карточки после синхронизации
      await loadCards();

      return true;
    } catch (error) {
      console.error("Ошибка синхронизации:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка синхронизации",
        text2: "Попробуйте позже",
        position: "bottom",
      });
      return false;
    }
  };

  // Обновляем обработчик для модалки синхронизации
  const handleSyncConfirm = async () => {
    setIsSyncModalVisible(false);
    return await handleSync();
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

                  <Pressable onPress={handleSharePress}>
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

      <SyncDeckModal
        visible={isSyncModalVisible}
        onClose={() => setIsSyncModalVisible(false)}
        onSync={handleSyncConfirm}
        type={isUserAuthor ? "user_updated" : "author_updated"}
      />

      <ShareDeckModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        onCopyLink={handleCopyLink}
        onMakePublic={handleMakePublic}
      />
    </View>
  );
}
