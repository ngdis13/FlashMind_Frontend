// --------------------------- React ---------------------------
import React, { useEffect, useState, useCallback, useRef } from "react";

// --------------------------- React Native ---------------------------
import {
  View,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  useWindowDimensions,
  RefreshControl,
} from "react-native";

// --------------------------- Expo ---------------------------
import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";

// --------------------------- Сторонние библиотеки ---------------------------
import Toast from "react-native-toast-message";

// --------------------------- Стили ---------------------------
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-list/styles/MainDecks.styles";

// --------------------------- Компоненты ---------------------------
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import DecksView from "@/feature-decks/deck-list/components/DecksView";

// --------------------------- Ассеты ---------------------------
import searchButton from "@/feature-decks/assets/searchButton.png";

// --------------------------- Хуки и хранилища ---------------------------
import { useDecks } from "@/storage/hooks/useDecks";
import { useCards } from "@/storage/hooks/useCards";

// --------------------------- Типы и утилиты ---------------------------
import { Deck } from "@/storage/types/types";
import { getPluralCards } from "@/utils/helpers/getPluralCards";



/**
 * Главный экран со списком колод пользователя
 * 
 * @component
 * @returns {JSX.Element} React компонент экрана колод
 * 
 * @description
 * Экран отображает:
 * - Заголовок "Мои колоды"
 * - Поле поиска по колодам
 * - Список колод в виде сетки (адаптивная ширина)
 * - Кнопку "Добавить колоду"
 * - Модальное окно с выбором действия (создать новую или импортировать)
 * - Pull-to-refresh для обновления списка
 * 
 * @example
 * // Использование в навигации
 * <MainDecksScreen />
 */
export default function MainDecksScreen() {
  // --------------------------- Состояния ---------------------------
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // --------------------------- Навигация ---------------------------
  const router = useRouter();

  // --------------------------- Хуки ---------------------------
  const { decks, loading, refreshDecks, loadDecksData } = useDecks();
  const { getDeckCards } = useCards();

  // --------------------------- Анимация ---------------------------
  const modalAnim = useRef(new Animated.Value(0)).current;

  // --------------------------- Окно ---------------------------
  const { width } = useWindowDimensions();
  const currentContentWidth = Math.min(width, 800);
  const numColumns = Math.max(2, Math.floor((currentContentWidth - 20) / 180));


  /**
   * Загрузка данных при монтировании компонента
   */
  useEffect(() => {
    loadDecksData();
  }, []);

  /**
   * Перезагрузка данных при фокусе экрана
   */
  useFocusEffect(
    useCallback(() => {
      const checkAndLoadData = async (): Promise<void> => {
        try {
          await loadDecksData(); // Берет данные из памяти, если они там уже есть
        } catch (error) {
          console.error('❌ Ошибка загрузки данных при фокусе:', error);
        }
      };
      
      checkAndLoadData();
    }, [loadDecksData])
  );

  /**
   * Обработчик обновления списка (Pull-to-refresh)
   * Принудительно обновляет данные из хранилища
   * 
   * @async
   * @returns {Promise<void>}
   */
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshDecks(); 

      Toast.show({
        type: "success",
        text1: "Колоды обновлены",
        position: "bottom",
        visibilityTime: 1500,
      });
    } catch (error) {
      console.error("❌ Ошибка обновления:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка обновления",
        text2: "Попробуйте позже",
        position: "bottom",
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshDecks]);

  /**
   * Открывает модальное окно для добавления колоды
   */
  const handleAddDecks = (): void => {
    setIsModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Закрывает модальное окно с анимацией
   */
  const closeItems = useCallback((): void => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
    });
  }, [modalAnim]);

  /**
   * Обработчик перехода на экран редактирования колоды
   * 
   * @param {string} id - ID колоды
   */
  const handleEditDecks = (id: string): void => {
    router.push(`/decks/${id}`);
  };
  
  /**
   * Обработчик нажатия на колоду для начала изучения
   * Загружает карточки и переходит на экран изучения
   * 
   * @param {string} id - ID колоды
   * @async
   */
  const handleDeckPress = useCallback(async (id: string): Promise<void> => {
    try {
      await getDeckCards(id);
      router.push(`/decks/${id}/study`);
    } catch (error) {
      console.error("Ошибка при подготовке карточек перед обучением:", error);
    }
  }, [getDeckCards, router]);

  /**
   * Получает цвет колоды из настроек или возвращает цвет по умолчанию
   * 
   * @param {Deck} deck - Объект колоды
   * @returns {string} HEX-код цвета
   */
  const getDeckColor = (deck: Deck): string => {
    return deck.settings?.color || colors.mainColor;
  };


  /**
   * Отфильтрованные колоды по поисковому запросу
   */
  const filteredDecks: Deck[] = search.trim()
    ? decks.filter((deck: Deck): boolean =>
        deck.name.toLowerCase().includes(search.toLowerCase()),
      )
    : decks;

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={colors.mainColor}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.wrapper}>
            <FlatList
              key={numColumns}
              data={filteredDecks}
              keyExtractor={(item: Deck): string => item.id}
              numColumns={numColumns}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={false} 
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.mainColor]}
                  tintColor={colors.mainColor}
                />
              }
              ListHeaderComponent={
                <View style={styles.headerContainer}>
                  <Typography variant="h1" style={{ marginBottom: 16 }}>
                    Мои колоды
                  </Typography>
                  <View style={styles.searchBox}>
                    <Input
                      style={{ textAlign: "left" }}
                      placeholder={"Поиск"}
                      value={search}
                      onChangeText={setSearch}
                    />
                    <Pressable style={styles.searchButton}>
                      <Image
                        source={searchButton}
                        style={{ width: 18, height: 18 }}
                      />
                    </Pressable>
                  </View>
                </View>
              }
              ListEmptyComponent={() => (
                <View style={{ marginTop: 8, alignItems: "center" }}>
                  <Typography variant="h2">
                    {search ? "Ничего не найдено :(" : "У вас пока нет колод"}
                  </Typography>
                </View>
              )}
              renderItem={({ item, index }: { item: Deck; index: number }) => {
                return (
                  <View style={styles.deckItemWrapper}>
                    <DecksView
                      title={item.name}
                      cardCount={getPluralCards(item.total_cards)}
                      onCardPress={() => handleDeckPress(item.id)}
                      onEditPress={() => handleEditDecks(item.id)}
                      cardCountRepeat={item.repeat_cards || 0}
                      index={index}
                      color={getDeckColor(item)}
                    />
                  </View>
                );
              }}
            />

            <MainButton
              style={styles.addDecksButton}
              title="Добавить колоду"
              onPress={handleAddDecks}
            />
          </View>
        )}

        {/* Модальное окно выбора действия */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={closeItems}
        >
          <TouchableWithoutFeedback onPress={closeItems}>
            <Animated.View
              style={[styles.modalOverlay, { opacity: modalAnim }]}
            >
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.modalContent,
                    {
                      opacity: modalAnim,
                      transform: [
                        {
                          scale: modalAnim.interpolate({
                            inputRange:[0,1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <MainButton
                    title="Создать новую колоду"
                    onPress={() => {
                      closeItems();
                      setTimeout(() => router.push("/create-decks"), 300);
                    }}
                    style={{ backgroundColor: "#fff", marginBottom: 12 }}
                    textColor={colors.darkMainColor}
                  />
                  <MainButton
                    title="Импортировать из облака"
                    onPress={() => {
                      closeItems();
                      setTimeout(() => router.push("/decks/cloud-decks"), 300);
                    }}
                    style={{ backgroundColor: "#fff" }}
                    textColor={colors.darkMainColor}
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
}