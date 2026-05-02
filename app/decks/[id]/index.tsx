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

  const loadCards = async () => {
    try {
      const fetchedCards = await getDeckCards(id as string);
      setCards(fetchedCards);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      // Передаем id колоды и id карточки в правильном порядке
      await removeCard(id as string, cardId);
      // Обновляем список локально
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    }
  };

  const renderCard = ({ item }: { item: Card }) => (
    <CardItem
      card_id={item.id}
      front={item.front}
      onPress={(cId) => router.push(`/card/${cId}?deckId=${id}`)}
      onDelete={handleDeleteCard}
    />
  );

  useEffect(() => { if (id) loadCards(); }, [id]);
  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
  }, [deck]);

  useFocusEffect(useCallback(() => { if (id) loadCards(); }, [id]));

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        // paddingHorizontal: 10 делает отступ 10px от краев экрана
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 30 }}
        ListHeaderComponent={
          <View style={[commonStyles.mainContent, { paddingHorizontal: 0 }]}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()}>
                <Image source={ReturnIcon} style={{ width: 12, height: 22, top: -7 }} />
              </Pressable>
              <Typography variant="h1" style={{ marginBottom: 16 }}>Вернуться к колодам</Typography>
            </View>

            <View style={styles.mainInfo}>
              <View style={commonStyles.mainBox}><Typography variant="h2">{name}</Typography></View>
              <View style={commonStyles.mainBox}><Typography variant="h2">{description}</Typography></View>
              <Pressable style={[commonStyles.mainBox, styles.settingsButton]}>
                <SettingsIcon /><Typography variant="h2">Настройки</Typography>
              </Pressable>
            </View>

            <View style={styles.cardsHeader}>
              <Typography variant="h2">Карточки</Typography>
              <Pressable onPress={() => router.push(`/decks/${id}/create-card`)} hitSlop={10}>
                <Image source={PlusIcon} style={{ width: 16, height: 16 }} />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Input placeholder="Поиск" value={search} onChangeText={setSearch} />
              <Pressable style={styles.searchButton}>
                <Image source={searchButton} style={{ width: 18, height: 18 }} />
              </Pressable>
            </View>
            <View style={{ height: 8 }} />
          </View>
        }
      />
    </View>
  );
}
