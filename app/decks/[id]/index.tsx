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

// ... (ваши импорты остаются теми же)

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { decks, loading, getDeckCards, removeCard } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  const deck = decks.find((d) => d.id === id);

  const loadCards = async () => {
    if (!id) return;
    try {
      const fetchedCards = await getDeckCards(id);
      setCards(fetchedCards || []);
    } catch (error) {
      console.error("Ошибка загрузки карточек:", error);
    }
  };

  // ИСПРАВЛЕННОЕ УДАЛЕНИЕ
  const handleDeleteCard = async (cardId: string) => {
    if (!id || !cardId) return;
    try {
      console.log("Удаляем карточку:", cardId, "из колоды:", id);
      await removeCard(id, cardId); // Проверьте в хуке useDecks, что порядок (deckId, cardId)
      
      // Срочное обновление локального состояния, чтобы карточка исчезла сразу
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err) {
      console.error("Ошибка при удалении карточки:", err);
    }
  };

  const handleCardPress = (cardId: string) => {
    router.push(`/card/${cardId}?deckId=${id}`);
  };

  useEffect(() => { loadCards(); }, [id]);
  
  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
  }, [deck]);

  useFocusEffect(useCallback(() => { loadCards(); }, [id]));

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        // Убираем padding отсюда, чтобы ListHeaderComponent сам решал свои отступы
        contentContainerStyle={{ paddingBottom: 30 }} 
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 16 }}> 
            <CardItem
              id={item.id}
              front={item.front}
              back={item.back}
              deckId={id}
              index={index}
              onPress={handleCardPress}
              onDelete={() => handleDeleteCard(item.id)} // Передаем функцию без лишних аргументов
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View style={commonStyles.mainContent}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()}>
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
              <Pressable style={[commonStyles.mainBox, styles.settingsButton]}>
                <SettingsIcon />
                <Typography variant="h2">Настройки</Typography>
              </Pressable>
            </View>

            <View style={styles.cardsHeader}>
              <Typography variant="h2">Карточки</Typography>
              <Pressable onPress={() => router.push(`/decks/${id}/create-card`)} hitSlop={10}>
                <Image source={PlusIcon} style={{ width: 16, height: 16 }} />
              </Pressable>
            </View>

            <View style={[styles.searchBox, { marginBottom: 24 }]}>
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
      />
    </View>
  );
}
