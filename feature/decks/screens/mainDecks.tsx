import { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import DecksView from "../components/DecksView";
import { styles } from "../styles/mainDecks.styles";
import searchButton from "../assets/searchButton.png";
import { getUserDecks } from "../api/decks.api";
import { colors } from "@/styles/Colors";
import { useRouter } from "expo-router";

export default function MainDecksScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [decks, setDecks] = useState([]); // Стейт для колод
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const router = useRouter()
  // Загружаем колоды при монтировании компонента
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const data = await getUserDecks();
        if (data?.decks) {
          setDecks(data.decks);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  const startSearch = () => {
    /* поиск */
  };
  const handleEditDecks = (id: string) => {
    /* редактирование по id */
  };
  const handleAddDecks = () => {
    setIsModalVisible(true);
  };
  const closeItems = () => {
    setIsModalVisible(false);
  };

  const ListHeader = () => (
    <View
      style={[
        commonStyles.mainContent,
        { paddingHorizontal: 0, marginHorizontal: 0, marginTop: 0 },
      ]}
    >
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
        <Pressable onPress={startSearch} style={styles.searchButton}>
          <Image source={searchButton} style={{ width: 18, height: 18 }} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[commonStyles.container]}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          numColumns={2} // Сетка в 2 колонки
          // Отступ между ЛЕВОЙ и ПРАВОЙ колонкой (16 пикселей)
          columnWrapperStyle={{ gap: 16 }}
          // Отступ между СТРОКАМИ (сверху и снизу)
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListHeaderComponent={ListHeader} // Заголовок
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 120, // Чтобы кнопка внизу не перекрывала последнюю карточку
            paddingTop: 20,
          }}
          renderItem={({ item, index }) => (
            <DecksView
              title={item.name}
              cardCount={item.total_cards}
              cardCountNow={0} // Подставь прогресс, если он есть
              onEditPress={() => handleEditDecks(item.id)}
              index={index}
            />
          )}
        />
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeItems}
      >
        <TouchableWithoutFeedback onPress={closeItems}>
          <View style={styles.modalOverlay}>
            {/* Контент модалки (фиолетовый фон с кнопками) */}
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <MainButton
                  title="Создать новую колоду"
                  onPress={() => {
                    router.push('/create-decks');
                     closeItems();
                  }}
                  style={{ backgroundColor: "#fff", marginBottom: 12 }}
                  textColor={colors.darkMainColor}
                />
                <MainButton
                  title="Импортировать из облака"
                  onPress={() => {
                    /* логика */ closeItems();
                  }}
                  style={{ backgroundColor: "#fff" }}
                  textColor={colors.darkMainColor}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <MainButton
        style={styles.addDecksButton}
        title="Добавить колоду"
        onPress={handleAddDecks}
      />
    </View>
  );
}
