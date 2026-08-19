import { useState, useEffect } from "react";
import { ScrollView, View, Image, Pressable, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-create-card/styles/CreateCard.style";
import { CardBlock, CreateCardPayload } from "../types/cardBlocks";

import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useCards } from "@/storage/hooks/useCards";
import viewCardIcon from "@/feature-decks/assets/viewCardIcon.png";
import editCardIcon from "@/feature-decks/assets/editCardIcon.png";
import iconInfo from "@/assets/icons/IconInfo.png";
import { useCardStore } from "@/store/card.store";

// Моки с первого экрана, переписанные под точную структуру карточки
const MOCK_RECENT_TEMPLATES: {
  id: string;
  title: string;
  front: CardBlock[];
  back: CardBlock[];
}[] = [
  {
    id: "template_1",
    title: "Немецкие глаголы",
    front: [{ id: "f1", type: "term", value: "", position: 0 }],
    back: [
      { id: "b1", type: "text", value: "", position: 0 },
      { id: "b2", type: "text", value: "", position: 1 },
    ],
  },
  {
    id: "template_2",
    title: "Столицы (квиз)",
    front: [
      { id: "f2", type: "term", value: "", position: 0 },
      {
        id: "f3",
        type: "quiz",
        variants: ["Берлин", "Мюнхен", "Франкфурт", "Гамбург"],
        correctIndex: 0,
        position: 1,
      },
    ],
    back: [{ id: "b3", type: "text", value: "", position: 0 }],
  },
  {
    id: "template_3",
    title: "Анатомия: Мышцы",
    front: [
      { id: "f4", type: "term", value: "", position: 0 },
      { id: "f5", type: "image", url: "", position: 1 },
    ],
    back: [{ id: "b4", type: "text", value: "", position: 0 }],
  },
];

const getBlockTypeName = (block: CardBlock): string => {
  switch (block.type) {
    case "term":
      return "Термин";
    case "text":
      return "Текст";
    case "quiz":
      return "Квиз";
    case "image":
      return "Картинка";
  }
};

export default function CreateCardView() {
  const { id, templateId } = useLocalSearchParams<{
    id: string;
    templateId: string;
  }>();
  const router = useRouter();
  const { addCard } = useCards();

  const [useFrontAsTitle, setUseFrontAsTitle] = useState(false);

  const title = useCardStore((s) => s.draftTitle);
  const setTitle = useCardStore((s) => s.setDraftTitle);
  const front = useCardStore((s) => s.draftFront);
  const setFront = useCardStore((s) => s.setDraftFront);
  const back = useCardStore((s) => s.draftBack);
  const setBack = useCardStore((s) => s.setDraftBack);
  const hint1 = useCardStore((s) => s.draftHint1);
  const setHint1 = useCardStore((s) => s.setDraftHint1);
  const hint2 = useCardStore((s) => s.draftHint2);
  const setHint2 = useCardStore((s) => s.setDraftHint2);
  const resetDraft = useCardStore((s) => s.resetDraft);

  // Загружаем блоки на основе выбранного шаблона
  useEffect(() => {
    resetDraft();
    if (templateId === "empty" || !templateId) {
      setFront([{ id: "f_empty", type: "term", value: "", position: 0 }]);
      setBack([{ id: "b_empty", type: "text", value: "", position: 0 }]);
    } else {
      const foundTemplate = MOCK_RECENT_TEMPLATES.find(
        (t) => t.id === templateId,
      );
      if (foundTemplate) {
        setFront(foundTemplate.front);
        setBack(foundTemplate.back);
        setTitle(foundTemplate.title);
      }
    }
  }, [templateId]);

  const handleBack = (): void => {
    router.push(`/decks/${id}/create-card`);
  };

  const handleViewCard = (): void => {};

  // Функция клика на карандаш
  const handleEditSideBlocks = (side: "front" | "back") => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: { side },
    });
  };

  const handleCreateCard = async (): Promise<void> => {
    try {
      const finalizedFront: CardBlock[] = front.map((block, index) => ({
        ...block,
        position: index,
      }));
      const finalizedBack: CardBlock[] = back.map((block, index) => ({
        ...block,
        position: index,
      }));

      const firstFront = front[0];
      const firstFrontValue =
        firstFront && "value" in firstFront ? firstFront.value : "";

      const cardPayload: CreateCardPayload = {
        deck_id: id as string,
        title: useFrontAsTitle ? firstFrontValue || "Без названия" : title,
        front: finalizedFront,
        back: finalizedBack,
        hint1: [hint1],
        hint2: [hint2],
      };

      console.log("🚀 Финальный JSON для отправки на бэкенд:", cardPayload);

      // Пока отправляем как строку, API не трогаем
      await addCard(id as string, JSON.stringify(cardPayload), "");

      Toast.show({
        type: "success",
        text1: "Карточка создана!",
        position: "bottom",
      });
      router.push(`/decks/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

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
          nestedScrollEnabled={Platform.OS === "android"}
        >
          {/* Шапка */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={20}
            >
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Создание карточки</Typography>
            <Pressable
              onPress={handleViewCard}
              style={styles.viewCardButton}
              hitSlop={20}
            >
              <Image source={viewCardIcon} style={{ width: 24, height: 24 }} />
            </Pressable>
          </View>

          {/* Инпут названия */}
          <View style={styles.titleBox}>
            <Input
              style={{ textAlign: "left" }}
              placeholder={"Название"}
              value={title}
              onChangeText={setTitle}
              editable={!useFrontAsTitle}
            />

            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setUseFrontAsTitle(!useFrontAsTitle)}
              hitSlop={15}
            >
              <View
                style={[
                  styles.checkbox,
                  useFrontAsTitle && styles.checkboxActive,
                ]}
              >
                {useFrontAsTitle && (
                  <Typography style={styles.checkmark}>✓</Typography>
                )}
              </View>
              <View style={styles.checkboxTextWrapper}>
                <Typography variant="h3" color={colors.darkGray}>
                  Использовать текст с лицевой стороны в качестве названия
                </Typography>
              </View>
            </Pressable>
          </View>

          {/* ЛИЦЕВАЯ СТОРОНА */}
          <View style={styles.sideBox}>
            <View style={styles.sideHeader}>
              <Typography variant="h2">Лицевая сторона</Typography>
              <Pressable
                onPress={() => handleEditSideBlocks("front")}
                hitSlop={15}
              >
                <Image
                  source={editCardIcon}
                  style={{ width: 29, height: 20 }}
                />
              </Pressable>
            </View>

            <View
              style={[
                commonStyles.mainBox,
                commonStyles.shadowBox,
                styles.infoBox,
              ]}
            >
              {[...front]
                .sort((a, b) => a.position - b.position)
                .map((block) => (
                  <View key={block.id} style={styles.blockItem}>
                    <Typography variant="span" color={colors.darkGray}>
                      {getBlockTypeName(block)}
                    </Typography>
                  </View>
                ))}
            </View>
          </View>

          {/* ОБРАТНАЯ СТОРОНА */}
          <View style={styles.sideBox}>
            <View style={styles.sideHeader}>
              <Typography variant="h2">Обратная сторона</Typography>
              <Pressable
                onPress={() => handleEditSideBlocks("back")}
                hitSlop={15}
              >
                <Image
                  source={editCardIcon}
                  style={{ width: 29, height: 20 }}
                />
              </Pressable>
            </View>

            <View
              style={[
                commonStyles.mainBox,
                commonStyles.shadowBox,
                styles.infoBox,
              ]}
            >
              {[...back]
                .sort((a, b) => a.position - b.position)
                .map((block) => (
                  <View key={block.id} style={styles.blockItem}>
                    <Typography variant="span" color={colors.darkGray}>
                      {getBlockTypeName(block)}
                    </Typography>
                  </View>
                ))}
            </View>
          </View>

          {/* Подсказки */}
          <View style={styles.hintBox}>
            <View style={styles.hintHeader}>
              <Typography variant="h2">Подсказки</Typography>
              <Image source={iconInfo} style={styles.iconInfo} />
            </View>
            <View style={styles.hintList}>
              <Input
                style={{ textAlign: "left" }}
                placeholder={"Подсказка 1"}
                value={hint1}
                onChangeText={setHint1}
              />
              <Input
                style={{ textAlign: "left" }}
                placeholder={"Подсказка 2"}
                value={hint2}
                onChangeText={setHint2}
              />
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
            style={styles.createCardButton}
            title="Создать карточку"
            onPress={handleCreateCard}
          />
        </View>
      </View>
    </View>
  );
}
