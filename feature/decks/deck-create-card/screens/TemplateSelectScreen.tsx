import { ScrollView, View, Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-create-card/styles/TemplateSelect.style";
import searchButton from "@/feature-decks/assets/searchButton.png";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { Input } from "@/components/Input";
import { AppEmojis } from "@/assets/emoji/emoji";
import { MainButton } from "@/components/MainButton";
import { useCardStore } from "@/store/card.store";


import { TemplateItem, TemplateCardMock } from "../components/TemplateItem";
import { useCards } from "@/storage/hooks/useCards";

export const TemplateSelectScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const { id } = useLocalSearchParams<{ id: string }>();

  const deckCards = useCardStore((s) => s.cards[id]?.cards);
  const { getDeckCards } = useCards();

  useEffect(() => {
    if (!deckCards) {
      getDeckCards(id);
    }
  }, [deckCards, getDeckCards, id]);

  //Последние три созданные пользователм карточки
  const recentTemplates = useMemo<TemplateCardMock[]>(() => {
    if (!deckCards) return [];
    return [...deckCards]
      .sort((a, b) => {
        // Сортируем по дате создания (новые сверху), без даты — в конец
        const ta = a.created_at ? Date.parse(a.created_at) : 0;
        const tb = b.created_at ? Date.parse(b.created_at) : 0;
        return tb - ta;
      })
      .slice(0, 3)
      .map((card) => ({
        id: card.id,
        title: card.title,
        front: card.front,
        back: card.back,
      }));
  }, [deckCards]);

  const handleBack = (): void => {
    router.push(`/decks/${id}`);
  };

  // Метод перехода в конструктор при выборе конкретного шаблона
  const handleSelectTemplate = (templateId: string) => {
    useCardStore.getState().resetDraft();
    router.push({
      pathname: `/decks/${id}/create-card/create`,
      params: { templateId },
    });
  };

  // Метод перехода для создания карточки с полного нуля
  const handleCreateTemplate = () => {
    useCardStore.getState().resetDraft();
    router.push({
      pathname: `/decks/${id}/create-card/create`,
      params: { templateId: "empty" },
    });
  };

  const filteredTemplates = recentTemplates.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 20,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={20}
            >
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Новая карточка</Typography>
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

          <View style={styles.templateBox}>
            <Typography variant="h2" style={styles.headerName}>
              <Image
                source={AppEmojis.star}
                style={styles.inlineEmoji}
                resizeMode="contain"
              />{" "}
              {""}
              Недавно созданные
            </Typography>
            <View style={{ width: "100%" }}>
              {filteredTemplates.map((template) => (
                <TemplateItem
                  key={template.id}
                  item={template}
                  onPress={handleSelectTemplate}
                />
              ))}
              {recentTemplates.length === 0 && (
                <Typography
                  variant="h3"
                  style={{ color: colors.darkGray, textAlign: "center" }}
                >
                  Здесь появятся последние созданные шаблоны карточек
                </Typography>
              )}
              {recentTemplates.length > 0 && filteredTemplates.length === 0 && (
                <Typography
                  variant="h3"
                  style={{ color: colors.darkGray, textAlign: "center" }}
                >
                  Ничего не найдено
                </Typography>
              )}
            </View>
          </View>
        </ScrollView>

        <View
          style={{
            width: "100%",
            paddingHorizontal: 10,
            alignItems: "center",
            marginBottom: BOTTOM_MARGIN,
          }}
        >
          <MainButton
            style={styles.createTemplateButton}
            title="Создать свой шаблон"
            onPress={handleCreateTemplate}
          />
        </View>
      </View>
    </View>
  );
};
