import { colors } from "@/styles/Colors";
import {
  Pressable,
  View,
  Image,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { styles } from "../styles/CloudDecksScreen.style";
import { Typography } from "@/styles/Typography";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import IconGo from "../assets/IconGo.png";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Input } from "@/components/Input";

import searchButton from "@/feature-decks/assets/searchButton.png";
import CloudDeckView from "../components/CloudDecksView";
import Toast from "react-native-toast-message";

const MOCK_DECKS = [
  {
    id: "1",
    title: "Дискретная математика",
    author: "Кочерова Анастасия",
    updatedAt: "2 дня назад",
    cardsCount: 65,
    downloadsCount: "5к",
  },
  {
    id: "2",
    title: "Инфокоммуникационные системы и технологии",
    author: "Иванов Александр",
    updatedAt: "3 дня назад",
    cardsCount: 120,
    downloadsCount: "3.5к",
  },
  {
    id: "3",
    title: "Линейная алгебра",
    author: "Петров Сергей",
    updatedAt: "1 неделю назад",
    cardsCount: 45,
    downloadsCount: "1.2к",
  },
  {
    id: "4",
    title: "Линейная алгебра",
    author: "Петров Сергей",
    updatedAt: "1 неделю назад",
    cardsCount: 45,
    downloadsCount: "1.2к",
  },
  {
    id: "5",
    title: "Линейная алгебра",
    author: "Петров Сергей",
    updatedAt: "1 неделю назад",
    cardsCount: 45,
    downloadsCount: "1.2к",
  },
  {
    id: "6",
    title: "Линейная алгебра",
    author: "Петров Сергей",
    updatedAt: "1 неделю назад",
    cardsCount: 45,
    downloadsCount: "1.2к",
  },
];

// Функция для очистки и извлечения ID из ссылки
const extractCloudDeckId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Регулярное выражение вытаскивает всё, что идет после последнего слэша,
  // либо берет саму строку, если слэша нет. Подходит под:
  // flashmind.ru/sdk2jbn432jh34, https://flashmind.ru или просто sdk2jbn432jh34
  const match = trimmed.match(/(?:[a-zA-Z0-9.-]+\/)?([a-zA-Z0-9_-]+)$/i);

  return match ? match[1] : null;
};

export default function CloudDecksScreen() {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [search, setSearch] = useState("");
  const { width } = useWindowDimensions();
  const currentContentWidth = Math.min(width, 800);

  const handleBack = () => {
    router.push("/decks");
  };

  const handlePrivateLink = () => {
    const cloudDeckId = extractCloudDeckId(link);
    if (!cloudDeckId) {
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Пожалуйста, введите корректную ссылку или ID",
        position: "bottom",
      });
      return;
    }
    console.log("Успешно распарсили ID колоды:", cloudDeckId);
    setLink("");
    router.push(`/decks/cloud-decks/${cloudDeckId}`);
  };

  const handleSearch = () => {
    console.log("поиск по колоде");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
      }}
    >
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.container, { width: currentContentWidth }]}>
          <View style={styles.content}>
            <View style={styles.mainContent}>
              {/* Шапка экрана */}
              <View style={styles.header}>
                <Pressable
                  onPress={handleBack}
                  style={styles.backButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image
                    source={ReturnIcon}
                    style={{ width: 12, height: 22 }}
                  />
                </Pressable>
                <Typography variant="h1">Облачные колоды</Typography>
              </View>

              {/* Добавление приватной колоды */}
              <View style={styles.privateLinkBox}>
                <Typography variant="h2">Добавить приватную колоду</Typography>
                <View style={styles.privateLinkLine}>
                  <Input
                    style={styles.privateLink}
                    placeholder={"Ссылка"}
                    placeholderColor={"#999EE4"}
                    value={link}
                    onChangeText={setLink}
                  />

                  <Pressable
                    onPress={handlePrivateLink}
                    style={styles.arrowButton}
                  >
                    <Image source={IconGo} style={{ width: 12, height: 22 }} />
                  </Pressable>
                </View>
              </View>

              {/* Доступные колоды */}
              <View style={styles.availableDecksSection}>
                <View style={styles.searchHeader}>
                  <Typography variant="h2">Доступные колоды</Typography>
                  <View style={styles.searchBox}>
                    <Input
                      style={{ textAlign: "left" }}
                      placeholder={"Поиск"}
                      value={search}
                      onChangeText={setSearch}
                    />
                    <Pressable
                      style={styles.searchButton}
                      onPress={handleSearch}
                    >
                      <Image
                        source={searchButton}
                        style={{ width: 18, height: 18 }}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Список доступных колод */}
              <View style={styles.decksList}>
                {MOCK_DECKS.map((deck) => (
                  <CloudDeckView
                    key={deck.id}
                    title={deck.title}
                    author={deck.author}
                    updatedAt={deck.updatedAt}
                    cardsCount={deck.cardsCount}
                    downloadsCount={deck.downloadsCount}
                    onPress={() =>
                      console.log("Кликнули на колоду:", deck.title)
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
