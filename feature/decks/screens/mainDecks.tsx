import { useEffect, useState, useCallback } from "react";
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
import { colors } from "@/styles/Colors";
import { useRouter } from "expo-router";
import { useDecks } from "@/storage/hooks/useDecks";
import { getPluralCards } from "@/utils/helpers/getPluralCards";

export default function MainDecksScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  
  const {
    decks,
    loading,
    refreshDecks,
  } = useDecks();

  // Логика фильтрации
  const filteredDecks = search.trim()
    ? decks.filter((deck) =>
        deck.name.toLowerCase().includes(search.toLowerCase()),
      )
    : decks;

  const handleEditDecks = (id: string) => {
    router.push(`/decks/${id}`);
  };

  const handleAddDecks = () => {
    setIsModalVisible(true);
  };

  const closeItems = () => {
    setIsModalVisible(false);
  };

  const handleDeckPress = (id: string) => {
    router.push(`/decks/${id}/study`);
  };

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filteredDecks} // Используем отфильтрованный список
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          
          // ВАЖНО: Передаем заголовок напрямую как JSX, чтобы не слетал фокус ввода
          ListHeaderComponent={
            <View style={[commonStyles.mainContent, { paddingHorizontal: 0, marginHorizontal: 0, marginTop: 0 }]}>
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
                  <Image source={searchButton} style={{ width: 18, height: 18 }} />
                </Pressable>
              </View>
            </View>
          }
          
          ListEmptyComponent={() => (
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <Typography variant="h3" color={colors.darkGray}>
                {search ? "Ничего не найдено" : "У вас пока нет колод"}
              </Typography>
            </View>
          )}

          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 120,
            paddingTop: 20,
          }}
          renderItem={({ item, index }) => (
            <DecksView
              title={item.name}
              cardCount={getPluralCards(item.total_cards)} 
              onCardPress={() => handleDeckPress(item.id)}  
              onEditPress={() => handleEditDecks(item.id)}
              cardCountNow={0} 
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
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <MainButton
                  title="Создать новую колоду"
                  onPress={() => {
                    router.push("/create-decks");
                    closeItems();
                  }}
                  style={{ backgroundColor: "#fff", marginBottom: 12 }}
                  textColor={colors.darkMainColor}
                />
                <MainButton
                  title="Импортировать из облака"
                  onPress={() => {
                    /* логика */ 
                    closeItems();
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
