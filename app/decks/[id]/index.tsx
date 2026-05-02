import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View, Image, Pressable, FlatList } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { styles } from "../styles/deckViewById.style";
import { Input } from "@/components/Input";
import { useCallback, useEffect, useState } from "react";
import { SettingsIcon } from "@/feature/profile/assets/SettingsIcon";
import PlusIcon from "@/assets/icons/PlusIcon.png";
import searchButton from "@/feature/decks/assets/searchButton.png";
import { colors } from "@/styles/Colors";
import { Logo } from "@/components/Logo";
import { useDecks } from "@/storage/hooks/useDecks";
import { CardItem } from "../components/CardItem";
import { Card } from "@/storage/types/types";

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { decks, loading, getDeckCards, removeCard } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  const deck = decks.find((d) => d.id === id);

  const handleBack = () => router.back();
  const handleSettings = () => { /* Переход в настройки */ };
  const handleAddCard = () => router.push(`/decks/${id}/create-card`);
  
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
  const targetDeckId = deckId || (id as string);
  
  try {
    // Вызываем функцию из хука
    await removeCard(targetDeckId, cardId);
    
    // ВАЖНО: Обновляем локальный стейт карточек именно этого экрана
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
    
    console.log("Карточка успешно удалена из интерфейса");
  } catch (err) {
    // Если сервер выдал 405 (ошибка со слэшем), мы попадем сюда
    console.error("Ошибка при удалении карточки:", err);
  }
};

  const renderCard = ({ item, index }: { item: Card; index: number }) => (
    <CardItem
      card_id={item.id}
      front={item.front}
      index={index}
      viewMode="compact"
      onPress={handleCardPress}
      onDelete={handleDeleteCard}
    />
  );

  useEffect(() => {
    if (id) loadCards();
  }, [id]);

  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
  }, [deck]);

  useFocusEffect(
    useCallback(() => {
      if (id) loadCards();
    }, [id]),
  );

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        // Отступ 16px между карточками
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View style={[commonStyles.mainContent]}>
            <View style={styles.header}>
              <Pressable onPress={handleBack}>
                <Image source={ReturnIcon} style={{ width: 12, height: 22, top: -7 }} />
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
              <Pressable style={[commonStyles.mainBox, styles.settingsButton]} onPress={handleSettings}>
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
              <Pressable style={styles.searchButton}>
                <Image source={searchButton} style={{ width: 18, height: 18 }} />
              </Pressable>
            </View>
            {/* Дополнительный отступ перед списком */}
            <View style={{ height: 8 }} />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyDeck}>
              <Logo size={144} style={{ marginBottom: 16 }} />
              <Typography color={colors.darkGray} style={{ textAlign: "center" }}>
                Пока что колода пуста...
              </Typography>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 30 }}
      />
    </View>
  );
}
