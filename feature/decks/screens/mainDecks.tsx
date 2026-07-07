import { useEffect, useState, useCallback, useRef } from "react";
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
import { useFocusEffect } from "expo-router";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import DecksView from "../components/DecksView";
import { styles } from "../styles/mainDecks.styles";
import searchButton from "../assets/searchButton.png";
import { colors } from "@/styles/Colors";
import { useRouter } from "expo-router";
import { useDecks } from "@/storage/hooks/useDecks";
import { getPluralCards } from "@/utils/helpers/getPluralCards";
import { Deck } from "@/storage/types/types";
import Toast from "react-native-toast-message";
import { useCards } from "@/storage/hooks/useCards";


export default function MainDecksScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { decks, loading, refreshDecks, loadDecksData } = useDecks();
  const { getDeckCards } = useCards();

  const modalAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const currentContentWidth = Math.min(width, 800);
  const numColumns = Math.max(2, Math.floor((currentContentWidth - 20) / 180));

  // ============================================
  // ⭐ 1. ЗАГРУЗКА ПРИ ПЕРВОМ ОТКРЫТИИ
  // ============================================
  useEffect(() => {
    console.log("🚀 Первичная загрузка колод");
    loadDecksData();
  }, []);

  // ============================================
  // ⭐ 2. ОБНОВЛЕНИЕ ПРИ ВОЗВРАТЕ - ВСЕГДА!
  // ============================================
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Обновляем колоды при возврате на главный экран');
      
      const refreshData = async () => {
        try {
          // ✅ Всегда обновляем с сервера!
          await refreshDecks();
          console.log('✅ Данные колод обновлены');
        } catch (error) {
          console.error('❌ Ошибка обновления данных:', error);
        }
      };
      
      refreshData();
    }, [refreshDecks])
  );

  // ============================================
  // ⭐ 3. PULL-TO-REFRESH
  // ============================================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log("🔄 Pull-to-refresh: обновляем колоды");
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

  // ============================================
  // ОСТАЛЬНЫЕ ФУНКЦИИ
  // ============================================
  
  const handleAddDecks = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeItems = useCallback(() => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
    });
  }, [modalAnim]);

  const filteredDecks = search.trim()
    ? decks.filter((deck) =>
        deck.name.toLowerCase().includes(search.toLowerCase()),
      )
    : decks;

  const handleEditDecks = (id: string) => router.push(`/decks/${id}`);
    const handleDeckPress = useCallback(async (id: string) => {
    try {
      console.log(`Нажата колода ${id}, подготавливаем актуальные карточки`);
      console.log('Вызываем getDeckCards, которая проверит или обновит данные с сервера')
      
      await getDeckCards(id); 
      
      console.log(`Карточки готовы в сторе, переходим к обучению`);
      router.push(`/decks/${id}/study`);
    } catch (error) {
      console.error("Ошибка при подготовке карточек перед обучением:", error);
    }
  }, [getDeckCards, router]);


  const getDeckColor = (deck: Deck): string => {
    return deck.settings?.color || colors.mainColor;
  };

  // ============================================
  // ОТРИСОВКА
  // ============================================
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
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContentContainer}
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
              renderItem={({ item, index }) => {
                // ✅ Логируем для проверки
                console.log(`📊 Колода: ${item.name}, repeat_cards: ${item.repeat_cards}`);
                
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
                            inputRange: [0, 1],
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