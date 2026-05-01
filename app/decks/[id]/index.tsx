// import { commonStyles } from "@/styles/Common";
// import { Typography } from "@/styles/Typography";
// import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
// import { ScrollView, View, Image, Pressable, FlatList } from "react-native";
import {View} from 'react-native'
// import ReturnIcon from "@/assets/icons/ReturnIcon.png";
// import { styles } from "../styles/deckViewById.style";
// import { Input } from "@/components/Input";
// import { useCallback, useEffect, useState } from "react";
// import { SettingsIcon } from "@/feature/profile/assets/SettingsIcon";
// import PlusIcon from "@/assets/icons/PlusIcon.png";
// import searchButton from "@/feature/decks/assets/searchButton.png";
// import { colors } from "@/styles/Colors";
// import { Logo } from "@/components/Logo";
// import { useDecks } from "@/storage/hooks/useDecks";
// import { CardItem } from "../components/CardItem";
// import { Card } from "@/storage/types/types";

export default function DeckViewById() {
  // const { id } = useLocalSearchParams<{ id: string }>();
  // const router = useRouter();

  // const { decks, loading, getDeckCards, removeCard } = useDecks();

  // const [name, setName] = useState("");
  // const [description, setDescription] = useState("");
  // const [search, setSearch] = useState("");
  // const [cards, setCards] = useState<Card[]>([]);

  // const deck = decks.find((d) => d.id === id);

  // const handleBack = () => {
  //   router.back();
  // };
  // const handleSettings = () => {
  //   //Переход в настройки колоды
  // };
  // const handleAddCard = () => {
  //   //Создание новой карточки в колоде
  //   router.push(`/decks/${id}/create-card`);
  // };
  // const startSearch = () => {
  //   //поиск по карточкам
  // };
  // const loadCards = async () => {
  //   try {
  //     const fetchedCards = await getDeckCards(id as string);
  //     setCards(fetchedCards);
  //     console.log("карточки колоды: ", fetchedCards);
  //   } catch (error) {
  //     console.error("Ошибка загрузки карточек:", error);
  //   }
  // };
  // const handleCardPress = (cardId: string) => {
  //   router.push(`/card/${cardId}?deckId=${id}`);
  // };

  // const handleDeleteCard = async (cardId: string, deckId?: string) => {
  //   try {
  //     await removeCard(deckId || (id as string), cardId);
  //     setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  //     console.log("Карточка удалена");
  //   } catch (err) {
  //     console.error("Ошибка при удалении карточки:", err);
  //   }
  // };

  // // Рендер отдельной карточки
  // const renderCard = ({ item, index }: { item: Card; index: number }) => (
  //   <CardItem
  //     id={item.id}
  //     front={item.front}
  //     back={item.back}
  //     deckId={id}
  //     index={index}
  //     viewMode="compact"
  //     onPress={handleCardPress}
  //     onDelete={handleDeleteCard}
  //   />
  // );

  // // Загружаем карточки колоды
  // useEffect(() => {
  //   if (id) {
  //     loadCards();
  //   }
  // }, [id]);

  // // Заполняем форму данными из колоды
  // useEffect(() => {
  //   if (deck) {
  //     setName(deck.name);
  //     setDescription(deck.description || "");
  //   }
  // }, [deck]);

  // useFocusEffect(
  //   useCallback(() => {
  //     // Обновляем карточки когда возвращаемся на экран
  //     if (id) {
  //       loadCards();
  //     }
  //   }, [id]),
  // );

  // const hasCards = cards.length > 0;

  return (
    <View style={[{ flex: 1 }]}>
      приветт
      {/* <View style={[commonStyles.container, { flex: 1 }]}></View> */}
      {/* <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        // Переносим всё, что было в ScrollView, в заголовок списка
        ListHeaderComponent={
          <View style={[commonStyles.mainContent]}>
            <View style={styles.header}>
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

            <View style={styles.mainInfo}>
              <View style={[commonStyles.mainBox, { maxWidth: "100%" }]}>
                <Typography variant="h2">{name}</Typography>
              </View>
              <View style={[commonStyles.mainBox, { maxWidth: "100%" }]}>
                <Typography variant="h2">{description}</Typography>
              </View>
              <Pressable
                style={[commonStyles.mainBox, styles.settingsButton]}
                onPress={handleSettings}
              >
                <SettingsIcon />
                <Typography variant="h2">Настройки</Typography>
              </Pressable>
            </View>

            <View style={styles.cardsHeader}>
              <Typography variant="h2">Карточки</Typography>
              <Pressable onPress={handleAddCard} hitSlop={10}>
                <Image source={PlusIcon} style={{ width: 16, height: 16 }} />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Input
                style={{ textAlign: "left" }}
                placeholder={"Поиск"}
                value={search}
                onChangeText={setSearch}
              />
              <Pressable onPress={startSearch} style={styles.searchButton}>
                <Image
                  source={searchButton}
                  style={{ width: 18, height: 18 }}
                />
              </Pressable>
            </View>
          </View>
        }
        // Компонент для пустой колоды
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyDeck}>
              <Logo size={144} style={{ marginBottom: 16 }} />
              <Typography
                color={colors.darkGray}
                style={{ textAlign: "center" }}
              >
                Пока что колода пуста...
              </Typography>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 30 }}
      /> */}
    </View>
  );
}
