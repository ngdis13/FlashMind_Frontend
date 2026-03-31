import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Image, Pressable, FlatList } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { styles } from "../styles/deckViewById.style";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
import { SettingsIcon } from "@/feature/profile/assets/SettingsIcon";
import PlusIcon from "@/assets/icons/PlusIcon.png";
import searchButton from "@/feature/decks/assets/searchButton.png";
import { MainButton } from "@/components/MainButton";
import { colors } from "@/styles/Colors";
import { Logo } from "@/components/Logo";
import { useDecks } from "@/storage/hooks/useDecks";
import { CardItem } from "../components/cardItem";

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { decks, loading, getDeckCards } = useDecks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const deck = decks.find((d) => d.id === id);

  const handleBack = () => {
    router.back();
  };
  const handleSettings = () => {
    //Переход в настройки колоды
  };
  const handleAddCard = () => {
    //Создание новой карточки в колоде
  };
  const startSearch = () => {
    //поиск по карточкам
  };
  const handleUpdateDeck = () => {
    //для подтвердджения обновления колоды
  };

  const loadCards = async () => {
    try {
      const fetchedCards = await getDeckCards(id as string);
      setCards(fetchedCards);
      console.log("карточки колоды: ", fetchedCards);
    } catch (error) {
      console.error("Ошибка загрузки карточек:", error);
    }
  };
  const handleCardPress = () => {
    //нажатие на карточку
  };

  // Рендер отдельной карточки
  const renderCard = ({ item, index }: { item: any; index: number }) => (
    <CardItem
      id={item.id}
      front={item.front || item.question} // адаптируем под вашу структуру
      back={item.back || item.answer} // адаптируем под вашу структуру
      deckId={id}
      index={index}
      viewMode="compact"
      onPress={handleCardPress}
    />
  );

  // Загружаем карточки колоды
  useEffect(() => {
    if (id) {
      loadCards();
    }
  }, [id]);

  // Заполняем форму данными из колоды
  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
  }, [deck]);

  const hasCards = cards.length > 0;

  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
      <ScrollView>
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
            <Input
              style={{ textAlign: "left" }}
              placeholder={"Название"}
              value={name}
              onChangeText={setName}
            />
            <Input
              style={{ textAlign: "left" }}
              placeholder={"Описание"}
              value={description}
              onChangeText={setDescription}
            />
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
              <Pressable
                onPress={handleAddCard}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
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
            {!hasCards ? (
              <View style={styles.emptyDeck}>
                <Logo size={144} style={{ marginBottom: 16 }} />
                <Typography
                  color={colors.darkGray}
                  style={{ textAlign: "center" }}
                >
                  Пока что колода пуста, но ты можешь добавить в нее карточку,
                  нажав на “+”
                </Typography>
              </View>
            ) : (
              <FlatList
                data={cards}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false} // отключаем скролл внутри ScrollView
                contentContainerStyle={{ paddingVertical: 8, gap: 16 }}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <MainButton
        style={styles.addDecksButton}
        title="Обновить колоду"
        onPress={handleUpdateDeck}
      />
    </View>
  );
}
