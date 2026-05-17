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
} from "react-native";
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

export default function MainDecksScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { decks, loading } = useDecks();

  const modalAnim = useRef(new Animated.Value(0)).current;
  //Настройка экрана
  const { width } = useWindowDimensions();
  const currentContentWidth = Math.min(width, 800);
  const numColumns = Math.max(2, Math.floor((currentContentWidth - 20) / 180));

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
  const handleDeckPress = (id: string) => router.push(`/decks/${id}/study`);

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
        ) : (
          // Добавляем внешний контейнер wrapper для правильного распределения высоты
          <View style={styles.wrapper}>
            <FlatList
              key={numColumns}
              data={filteredDecks}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContentContainer}
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
              renderItem={({ item, index }) => (
                <View style={styles.deckItemWrapper}>
                  <DecksView
                    title={item.name}
                    cardCount={getPluralCards(item.total_cards)}
                    onCardPress={() => handleDeckPress(item.id)}
                    onEditPress={() => handleEditDecks(item.id)}
                    cardCountNow={0}
                    index={index}
                  />
                </View>
              )}
            />

            {/* Кнопка теперь в самом низу этого контейнера */}
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
                    onPress={closeItems}
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
