// screens/decks/[id]/index.tsx
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Image, Pressable, Platform } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { styles } from "../styles/deckViewById.style";
import { Input } from "@/components/Input";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
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
import GreatIcon from "@/feature-decks/assets/GreatIcon.png";
import ImportButton from "@/feature-decks/assets/importButton.png";
import { ShareDeckModal } from "../components/ShareDeckModal";
import * as Clipboard from "expo-clipboard";
import { SyncDeckModal } from "../components/SyncDeckModal";
import { CustomAlertCloud } from "../components/CustomAlertCloud";

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // ✅ Берем данные из стора
  const { 
    decks, 
    getDeckCards, 
    removeCard, 
    makeDeckPublic, 
    importDeck, 
    refreshDecks,
    loadDecksData
  } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [addedCardsCount, setAddedCardsCount] = useState(0);

  // ✅ Флаг для предотвращения дублирующихся загрузок
  const isLoadingRef = useRef(false);
  const isFirstLoadRef = useRef(true);

  // Находим колоду в сторе
  const deck = decks.find((d) => d.id === id);

  // Проверяем статус колоды
  const isCloudDeck = deck?.cloud_info?.is_cloud_deck === true;
  const needsSync = deck?.cloud_info?.needs_sync === true;
  const cloudDeckId = deck?.cloud_info?.cloud_deck_id;
  const isAuthor = deck?.cloud_info?.is_author === true;

  // Показываем иконку только если колода облачная
  const showCloudAlert = isCloudDeck && needsSync;
  const showCloudOk = isCloudDeck && !needsSync;

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [cachedCloudUuid, setCachedCloudUuid] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
  const [isAccessModalVisible, setIsAccessModalVisible] = useState(false);
  const [isAddedAccessModalVisible, setIsAddedAccessModalVisible] = useState(false);

  useEffect(() => {
    if (cloudDeckId) {
      setCachedCloudUuid(cloudDeckId);
    } else {
      setCachedCloudUuid(null);
    }
  }, [cloudDeckId]);

  // ============================================
  // ⭐ ГЛАВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ
  // ============================================
  const loadData = useCallback(async (forceRefresh = false) => {
    // Защита от дублирующихся вызовов
    if (isLoadingRef.current) {
      console.log('⏳ Загрузка уже выполняется, пропускаю');
      return;
    }

    if (!id) return;

    try {
      isLoadingRef.current = true;
      console.log(`📱 Загружаем данные для колоды ${id}, force: ${forceRefresh}`);

      // 1. Загружаем колоды (если нужно)
      if (forceRefresh || decks.length === 0) {
        console.log('🔄 Загружаем колоды...');
        await loadDecksData();
      }

      // 2. Загружаем карточки
      console.log('🃏 Загружаем карточки...');
      const fetchedCards = await getDeckCards(id as string);
      setCards(fetchedCards);
      console.log(`✅ Загружено ${fetchedCards.length} карточек`);

      // 3. Обновляем информацию о колоде
      const updatedDeck = decks.find((d) => d.id === id);
      if (updatedDeck) {
        setName(updatedDeck.name);
        setDescription(updatedDeck.description || "");
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      Toast.show({
        type: "error",
        text1: "Ошибка загрузки",
        text2: "Не удалось загрузить данные",
        position: "bottom",
      });
    } finally {
      isLoadingRef.current = false;
      isFirstLoadRef.current = false;
    }
  }, [id, decks.length, loadDecksData, getDeckCards]);

  // ============================================
  // ⭐ ТОЛЬКО ОДИН useEffect для загрузки
  // ============================================
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // ============================================
  // ⭐ Обновляем данные при возврате на экран
  // ============================================
  useFocusEffect(
    useCallback(() => {
      if (id) {
        // Проверяем, изменились ли данные
        const currentDeck = decks.find((d) => d.id === id);
        if (currentDeck) {
          // Обновляем имя/описание если изменились
          setName(currentDeck.name);
          setDescription(currentDeck.description || "");
        }
        
        // Обновляем карточки только если это не первый загруз
        if (!isFirstLoadRef.current) {
          console.log('🔄 Фоновое обновление при фокусе');
          loadData(false);
        }
      }
    }, [id, decks, loadData])
  );

  // ============================================
  // ⭐ Обновляем информацию о колоде из стора
  // ============================================
  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
      
      // Если в сторе уже есть карточки - используем их
      if (deck.cards && deck.cards.length > 0 && cards.length === 0) {
        console.log(`📦 Использую карточки из стора (${deck.cards.length} шт.)`);
        setCards(deck.cards);
      }
    }
  }, [deck]);

  // ============================================
  // ⭐ ОБРАБОТЧИК SHARE
  // ============================================
  const handleSharePress = async () => {
    if (isGenerating) return;

    // СЦЕНАРИЙ 1: Колода облачная, синхронизация НЕ нужна
    if (isCloudDeck && !needsSync) {
      console.log("✅ Облачная колода, синхронизация не нужна");
      if (cloudDeckId) {
        setCachedCloudUuid(cloudDeckId);
        setIsShareModalVisible(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Ошибка",
          text2: "Не найден идентификатор колоды",
          position: "bottom",
        });
      }
      return;
    }

    // СЦЕНАРИЙ 2: Колода облачная, НУЖНА синхронизация
    if (isCloudDeck && needsSync) {
      console.log("🔄 Облачная колода, нужна синхронизация");
      if (id) {
        try {
          setIsGenerating(true);

          Toast.show({
            type: "info",
            text1: "Синхронизация с облаком...",
            position: "bottom",
          });

          const response = await makeDeckPublic(id);
          console.log("📦 Ответ от makeDeckPublic:", response);

          const cloudUuid = response?.cloud_uuid;

          if (cloudUuid) {
            setCachedCloudUuid(cloudUuid);
            setIsShareModalVisible(true);

            Toast.show({
              type: "success",
              text1: "Синхронизация выполнена",
              position: "bottom",
              visibilityTime: 1500,
            });
          } else {
            throw new Error("Сервер не вернул cloud_uuid");
          }
        } catch (error) {
          console.error("❌ Ошибка синхронизации:", error);
          Toast.show({
            type: "error",
            text1: "Ошибка",
            text2: "Не удалось синхронизировать",
            position: "bottom",
          });
        } finally {
          setIsGenerating(false);
        }
      }
      return;
    }

    // СЦЕНАРИЙ 3: Колода ЛОКАЛЬНАЯ (не облачная)
    if (!isCloudDeck && id) {
      console.log("🆕 Локальная колода, создаем ссылку");
      try {
        setIsGenerating(true);

        Toast.show({
          type: "info",
          text1: "Создание ссылки доступа...",
          position: "bottom",
        });

        const response = await makeDeckPublic(id);
        console.log("📦 Ответ от makeDeckPublic (локальная):", response);

        const cloudUuid = response?.cloud_uuid;

        if (cloudUuid) {
          setCachedCloudUuid(cloudUuid);
          setIsShareModalVisible(true);

          Toast.show({
            type: "success",
            text1: "Ссылка создана!",
            position: "bottom",
            visibilityTime: 1500,
          });
        } else {
          throw new Error("Сервер не вернул cloud_uuid");
        }
      } catch (error) {
        console.error("❌ Ошибка создания ссылки:", error);
        Toast.show({
          type: "error",
          text1: "Ошибка",
          text2: "Не удалось создать ссылку",
          position: "bottom",
        });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Если ничего не подошло
    Toast.show({
      type: "error",
      text1: "Ошибка",
      text2: "Неизвестный статус колоды",
      position: "bottom",
    });
  };

  // ============================================
  // ⭐ КОПИРОВАНИЕ ССЫЛКИ
  // ============================================
  const handleCopyLink = async () => {
    const cloudUuid = cachedCloudUuid || cloudDeckId;

    if (!cloudUuid) {
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Ссылка еще не создана",
        position: "bottom",
      });
      return;
    }

    const shareUrl = `https://flashmind.ru/decks/cloud-decks/${cloudUuid}`;

    try {
      let copySuccess = false;

      if (Platform.OS === "web") {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          copySuccess = true;
        } else {
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
            }
          } catch (err) {
            console.error("execCommand failed:", err);
          }

          document.body.removeChild(textArea);
        }
      } else {
        await Clipboard.setStringAsync(shareUrl);
        copySuccess = true;
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
      Toast.show({
        type: "info",
        text1: "Ссылка для копирования",
        text2: shareUrl,
        position: "bottom",
        visibilityTime: 5000,
      });
    }
  };

  // ============================================
  // ⭐ ПУБЛИКАЦИЯ В КАТАЛОГ
  // ============================================
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
      Toast.show({
        type: "error",
        text1: "Ошибка публикации",
        text2: "Попробуйте позже",
        position: "bottom",
      });
      return false;
    }
  };

  // ============================================
  // ⭐ НАВИГАЦИЯ
  // ============================================
  const handleBack = () => {
    router.push("/decks");
  };

  const handleSettings = () => {
    router.push(`/decks/${id}/settings`);
  };

  const handleAddCard = () => {
    router.push(`/decks/${id}/create-card?deckId=${id}`);
  };

  const handleCardPress = (cardId: string) => {
    router.push(`/card/${cardId}?deckId=${id}`);
  };

  // ============================================
  // ⭐ УДАЛЕНИЕ КАРТОЧКИ
  // ============================================
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

  // ============================================
  // ⭐ СИНХРОНИЗАЦИЯ
  // ============================================
  const handleCloudSyncAlert = () => {
    setIsSyncModalVisible(true);
  };

  const handleAccessSync = () => {
    setIsAccessModalVisible(true);
  };

  const handleSync = async () => {
    if (!id) return false;

    try {
      if (isAuthor || !isCloudDeck) {
        console.log("📤 Синхронизация через /share (АВТОР)");
        console.log(`📤 Локальный ID колоды: ${id}`);

        Toast.show({
          type: "info",
          text1: "Публикация изменений...",
          position: "bottom",
        });

        const response = await makeDeckPublic(id);
        console.log("📤 Ответ от makeDeckPublic:", response);

        Toast.show({
          type: "success",
          text1: "Изменения опубликованы",
          position: "bottom",
        });

        await loadData(true);
        return true;
      } else {
        console.log("Синхронизация через /import (ПОЛЬЗОВАТЕЛЬ)");

        if (!cloudDeckId) {
          console.error("cloudDeckId не найден:", {
            localId: id,
            deck: deck,
            cloudInfo: deck?.cloud_info,
          });

          Toast.show({
            type: "error",
            text1: "Ошибка",
            text2: "Не найден идентификатор облачной колоды",
            position: "bottom",
          });
          return false;
        }

        console.log(`Cloud UUID для импорта: ${cloudDeckId}`);
        console.log(`Локальный ID (не используется для импорта): ${id}`);

        const importedDeck = await importDeck(cloudDeckId);
        console.log("Результат импорта:", importedDeck);

        const addedCount = importedDeck.added || 0;
        setAddedCardsCount(addedCount);

        if (importedDeck.cards) {
          setCards(importedDeck.cards);
        }

        setIsSyncModalVisible(false);
        setIsAddedAccessModalVisible(true);

        return true;
      }
    } catch (error) {
      console.error("Ошибка синхронизации:", error);

      let errorMessage = "Попробуйте позже";
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Колода не найдена на сервере";
        } else if (error.message.includes("403")) {
          errorMessage = "Нет доступа к колоде";
        } else {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: "error",
        text1: "Ошибка синхронизации",
        text2: errorMessage,
        position: "bottom",
      });
      return false;
    }
  };

  const handleSyncConfirm = async () => {
    setIsSyncModalVisible(false);
    return await handleSync();
  };

  // ============================================
  // ⭐ УСПЕШНОЕ ЗАВЕРШЕНИЕ СИНХРОНИЗАЦИИ
  // ============================================
  const handleSuccessConfirm = async () => {
    setIsAddedAccessModalVisible(false);

    try {
      console.log("🔄 Перезагружаем данные после синхронизации...");

      await refreshDecks();
      await loadData(true);

      Toast.show({
        type: "success",
        text1: "Колода обновлена!",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Не удалось обновить данные",
        position: "bottom",
      });
    }
  };

  // ============================================
  // ⭐ ФИЛЬТРАЦИЯ КАРТОЧЕК
  // ============================================
  const filteredCards = useMemo(() => {
    return cards.filter((card) =>
      card.front.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, cards]);

  const hasCards = cards.length > 0;

  // ============================================
  // ⭐ ОТРИСОВКА
  // ============================================
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

                  {showCloudOk && (
                    <Pressable
                      onPress={handleAccessSync}
                      style={styles.cloudAlertAbsoluteLeft}
                    >
                      <Image
                        source={GreatIcon}
                        style={{ width: 24, height: 24 }}
                      />
                    </Pressable>
                  )}

                  <Pressable onPress={handleSharePress} disabled={isGenerating}>
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
        type={isAuthor ? "user_updated" : "author_updated"}
      />

      <ShareDeckModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        onCopyLink={handleCopyLink}
        onMakePublic={handleMakePublic}
        isAuthor={isAuthor}
      />

      <CustomAlertCloud
        visible={isAccessModalVisible}
        onCancel={() => setIsAccessModalVisible(false)}
        message={"Колода синхронизирована"}
        metaMessage={
          "На этой колоде установлена самая свежая версия. Обновления не требуются."
        }
        confirmText={"Понятно"}
        onConfirm={() => setIsAccessModalVisible(false)}
      />

      <CustomAlertCloud
        visible={isAddedAccessModalVisible}
        onCancel={() => setIsAddedAccessModalVisible(false)}
        message="Супер!"
        metaMessage={
          addedCardsCount > 0
            ? `Теперь у тебя +${addedCardsCount} карточ${addedCardsCount === 1 ? "ка" : addedCardsCount < 5 ? "ки" : "ек"} в колоде`
            : "На этой колоде установлена самая свежая версия. Обновления не требуются."
        }
        confirmText="Отлично"
        onConfirm={handleSuccessConfirm}
      />
    </View>
  );
}