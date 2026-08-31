import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Image,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { styles } from "@/feature-decks/deck-create-card/styles/CreateCard.style";
import { CardBlock } from "../types/cardBlocks";
import { CreateCardPayload } from "@/storage/types/types";
import { blocksToPlainText } from "@/utils/helpers/blocksToPlainText";

import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useCards } from "@/storage/hooks/useCards";
import viewCardIcon from "@/feature-decks/assets/viewCardIcon.png";
import editCardIcon from "@/feature-decks/assets/editCardIcon.png";
import iconInfo from "@/assets/icons/IconInfo.png";
import { useCardStore } from "@/store/card.store";
import { PreviewModal } from "../components/PreviewModal";

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
  const {
    id: routeId,
    deckId,
    templateId,
    cardId,
  } = useLocalSearchParams<{
    id?: string;
    deckId?: string; // приходит с маршрута /card/[cardId]
    templateId?: string;
    cardId?: string; // если есть — режим редактирования существующей карточки
  }>();
  // На маршруте создания колода приходит как id, на /card/[cardId] — как deckId
  const id = (routeId || deckId) as string;
  const isEditMode = Boolean(cardId);
  const router = useRouter();
  const { addCard, updateCard, getCardById } = useCards();

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
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const hasUnsavedChanges = (): boolean => {
    if (isEditMode) return false;

    // Проверяем наличие вообще любого блока на лицевой или обратной стороне
    const hasAnyBlocks = front.length > 0 || back.length > 0;

    // Считаем изменения: инпуты, подсказки или наличие блоков в ленте
    return (
      title.trim().length > 0 ||
      hint1.trim().length > 0 ||
      hint2.trim().length > 0 ||
      hasAnyBlocks
    );
  };


  // Загружаем блоки на основе выбранного шаблона
  useEffect(() => {
    // В режиме редактирования шаблоны не загружаем
    if (isEditMode) return;
    // Не трогаем черновик, если он уже заполнен (вернулись с редактирования)
    if (front.length > 0 || back.length > 0) return;

    if (templateId === "empty" || !templateId) {
      setFront([]);
      setBack([]);
      setTitle("");
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

  // Режим редактирования: загружаем существующую карточку в черновик (v2.0.0)
  useEffect(() => {
    if (!cardId) return;
    let cancelled = false;
    (async () => {
      const card = await getCardById(cardId as string);
      if (!card || cancelled) return;
      // Заполняем черновик только если он пуст (не перезаписываем правки,
      // сделанные в side-editor при возврате на экран)
      if (front.length === 0 && back.length === 0) {
        setTitle(card.title);
        setFront(card.front);
        setBack(card.back);
        setHint1(card.hint1 ?? "");
        setHint2(card.hint2 ?? "");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const handleBack = (): void => {
    if (isEditMode) {
      router.push(`/decks/${id}`);
      return;
    }

    // Если поля заполнены — срабатывает usePreventRemove, мы просто триггерим Тост и блокируем переход
    if (hasUnsavedChanges()) {
      Toast.show({
        type: "error",
        text1: "Карточка не создана",
        text2: "Сохраните карточку, прежде чем выйти",
        position: "bottom",
      });
      return;
    }

    resetDraft();
    router.push(`/decks/${id}/create-card`);
  };

  const handleViewCard = (): void => {
    setIsPreviewVisible(true);
  };

  // Функция клика на карандаш
  const handleEditSideBlocks = (side: "front" | "back") => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: { side },
    });
  };

  const handleSaveCard = async (): Promise<void> => {
    try {
      // Финализируем позиции блоков (0, 1, 2...) перед отправкой
      const finalizedFront: CardBlock[] = front.map((block, index) => ({
        ...block,
        position: index,
      }));
      const finalizedBack: CardBlock[] = back.map((block, index) => ({
        ...block,
        position: index,
      }));

      // v2.0.0: title из текста первого блока (plain text, без HTML-тегов)
      const firstFront = front[0];
      const firstFrontText = blocksToPlainText(firstFront ? [firstFront] : []);

      const cardTitle = useFrontAsTitle
        ? firstFrontText || "Без названия"
        : title.trim() || "Без названия";
      const hint1Value = hint1.trim() || null;
      const hint2Value = hint2.trim() || null;

      if (isEditMode && cardId) {
        // Частичное обновление существующей карточки (v2.0.0)
        await updateCard(cardId as string, {
          title: cardTitle,
          front: finalizedFront,
          back: finalizedBack,
          hint1: hint1Value,
          hint2: hint2Value,
        });
        Toast.show({
          type: "success",
          text1: "Изменения сохранены!",
          position: "bottom",
        });
      } else {
        const cardPayload: CreateCardPayload = {
          deck_id: id as string,
          title: cardTitle,
          front: finalizedFront,
          back: finalizedBack,
          hint1: hint1Value,
          hint2: hint2Value,
        };
        console.log("🚀 Финальный payload для бэкенда (v2.0.0):", cardPayload);
        await addCard(cardPayload);
        Toast.show({
          type: "success",
          text1: "Карточка создана!",
          position: "bottom",
        });
      }

      resetDraft(); // очищаем черновик после сохранения
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
            <Typography variant="h2">
              {isEditMode ? "Просмотр карточки" : "Создание карточки"}
            </Typography>
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

          {/* ЛИЦЕВАЯ СТОРОНА - показываем всегда заголовок и кнопку, блок скрываем если пусто */}
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

            {/* Показываем блок ТОЛЬКО если есть блоки */}
            {front.length > 0 && (
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
            )}
          </View>

          {/* ОБРАТНАЯ СТОРОНА - показываем всегда заголовок и кнопку, блок скрываем если пусто */}
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

            {/* Показываем блок ТОЛЬКО если есть блоки */}
            {back.length > 0 && (
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
            )}
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
            title={isEditMode ? "Сохранить изменения" : "Создать карточку"}
            onPress={handleSaveCard}
          />
        </View>
      </View>
      {/* УНИВЕРСАЛЬНЫЙ ПОП-АП ПРЕВЬЮ С ПЕРЕВОРОТОМ ПО ТАПУ НА БЕЛУЮ ОБЛАСТЬ */}
      <PreviewModal
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        // Передаем обе стороны из стора. Ротация будет подстраиваться под то, с какого экрана зашли!
        frontBlocks={front}
        backBlocks={back}
        // Магия: если зашли с экрана "обратной стороны", поп-ап автоматически откроется изнанкой (ОТВЕТОМ) вперед
        initialSide={"front"}
      />
    </View>
  );
}
function usePreventRemove(arg0: boolean, arg1: () => void) {
  throw new Error("Function not implemented.");
}
