import { colors } from "@/styles/Colors";
import {
  Pressable,
  View,
  Image,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { styles } from "../styles/CloudDecksScreen.style";
import { Typography } from "@/styles/Typography";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import IconGo from "../assets/IconGo.png";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/Input";

import searchButton from "@/feature-decks/assets/searchButton.png";
import CloudDeckView from "../components/CloudDecksView";
import Toast from "react-native-toast-message";
import { CloudDeckItem } from "../types/types";
import { fetchCloudDecks } from "../api/api";

// Хелпер извлечения ID приватной колоды
const extractCloudDeckId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/(?:[a-zA-Z0-9.-]+\/)?([a-zA-Z0-9_-]+)$/i);
  return match ? match[1] : null;
};

// Хелпер форматирования даты
const formatDate = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};

export default function CloudDecksScreen() {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [search, setSearch] = useState("");
  const { width } = useWindowDimensions();
  const currentContentWidth = Math.min(width, 800);

  const [decks, setDecks] = useState<CloudDeckItem[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadDecks = async () => {
    try {
      setLoading(true);
      const data = await fetchCloudDecks();
      const sortedDecks = (data.decks || []).sort((a, b) => 
        (b.downloaded || 0) - (a.downloaded || 0)
      );
      setDecks(sortedDecks);
    } catch (error) {
      console.error("Ошибка загрузки публичных колод:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка загрузки",
        text2: "Не удалось получить список облачных колод",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  loadDecks();
}, []);

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
    setLink("");
    router.push(`/decks/cloud-decks/${cloudDeckId}`);
  };

  // Фильтрация с учетом регистра и поиском по имени и автору
  const filteredDecks = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    
    if (!trimmedSearch) {
      return decks; 
    }

    return decks.filter((deck) => {

      const nameMatch = deck.name.toLowerCase().includes(trimmedSearch);
      const authorName = `${deck.author?.first_name || ""} ${deck.author?.last_name || ""}`.trim().toLowerCase();
      const authorMatch = authorName.includes(trimmedSearch);
      
      return nameMatch || authorMatch;
    });
  }, [decks, search]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const clearSearch = () => {
    setSearch("");
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
              {/* Шапка */}
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

              {/* Приватная ссылка */}
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

              {/* Заголовок доступных колод */}
              <View style={styles.availableDecksSection}>
                <View style={styles.searchHeader}>
                  <Typography variant="h2">
                    Доступные колоды 
                    {search.trim() && (
                      <Typography variant="h2" color={colors.darkGray}>
                        {" "}
                        (найдено: {filteredDecks.length})
                      </Typography>
                    )}
                  </Typography>
                  
                  <View style={styles.searchBox}>
                    <Input
                      style={{ textAlign: "left" }}
                      placeholder={"Поиск по названию или автору"}
                      value={search}
                      onChangeText={handleSearchChange} 
                    />
                    <Pressable
                      style={styles.searchButton}
                      onPress={handleSearchChange} 
                    >
                      <Image
                        source={searchButton}
                        style={{ width: 18, height: 18 }}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Список */}
              <View style={styles.decksList}>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.mainColor}
                    style={{ marginTop: 40 }}
                  />
                ) : filteredDecks.length === 0 ? (
                  <View style={{ marginTop: 40, alignItems: "center" }}>
                    <Typography
                      variant="h3"
                      style={{ textAlign: "center", color: "#999" }}
                    >
                      {search.trim() 
                        ? "По вашему запросу ничего не найдено" 
                        : "Колоды не найдены"}
                    </Typography>
                    {search.trim() && (
                      <Pressable onPress={clearSearch} style={{ marginTop: 12 }}>
                        <Typography
                          variant="h3"
                          style={{ color: colors.mainColor }}
                        >
                          Очистить поиск
                        </Typography>
                      </Pressable>
                    )}
                  </View>
                ) : (
                  filteredDecks.map((deck) => {
                    const avatar = deck.author?.avatar_url;

                    return (
                      <CloudDeckView
                        key={deck.id}
                        title={deck.name}
                        author={`${deck.author?.first_name || ""} ${deck.author?.last_name || ""}`.trim() || "Неизвестный автор"}
                        updatedAt={formatDate(deck.last_synced_at)}
                        cardsCount={deck.total_cards}
                        downloadsCount={String(deck.downloaded)}
                        avatarUrl={avatar}
                        onPress={() =>
                          router.push(`/decks/cloud-decks/${deck.id}`)
                        }
                      />
                    );
                  })
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}