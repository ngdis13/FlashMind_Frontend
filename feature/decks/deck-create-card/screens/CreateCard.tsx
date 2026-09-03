// ============================================================
// ИМПОРТЫ
// ============================================================
import React, { useState, useEffect } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
import { CustomAlert } from "@/components/CustomAlert";
import { LogoSadStar } from "@/components/LogoSadStar";

// ============================================================
// КОНСТАНТЫ
// ============================================================

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

// ============================================================
// ХЕЛПЕРЫ И ПОДКОМПОНЕНТЫ
// ============================================================

// Тип блока по-русски — подпись над превью блока в ленте конструктора
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

// Пустой блок: term/text без текста, image без url, quiz без вариантов
const isBlockEmpty = (block: CardBlock): boolean => {
  if (block.type === "image") return !block.url;
  if (block.type === "quiz") {
    return !block.variants || block.variants.every((v) => !v.trim());
  }
  return blocksToPlainText([block]).trim() === "";
};

// Текст первого текстового блока (term/text с непустым содержимым);
// картинки и пустые блоки пропускаются. Если таких нет — ""
const getFirstFrontText = (blocks: CardBlock[]): string => {
  const sorted = [...blocks].sort((a, b) => a.position - b.position);
  for (const block of sorted) {
    if (block.type !== "term" && block.type !== "text") continue;
    const text = blocksToPlainText([block]).trim();
    if (text) return text;
  }
  return "";
};

// Обёртка блока в ленте конструктора: красная рамка (errorColor), пока блок
// пуст, и тряска при каждой попытке сохранения с пустым блоком.
// ВАЖНО: объявлен на уровне модуля — внутри CreateCardView компонент
// пересоздавался бы на каждом рендере, и анимация ломалась перемонтированием.
const ShakeableBlock: React.FC<{
  isInvalid: boolean;
  shakeKey: number;
  children: React.ReactNode;
}> = ({ isInvalid, shakeKey, children }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (!isInvalid || shakeKey === 0) return;
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 70 }),
      withTiming(-7, { duration: 60 }),
      withTiming(7, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeKey, isInvalid, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          styles.blockItem,
          isInvalid && { borderColor: colors.errorColor },
        ]}
      >
        {children}
      </View>
    </Animated.View>
  );
};

// ============================================================
// ЭКРАН: КОНСТРУКТОР КАРТОЧКИ (создание + редактирование)
// ============================================================
export default function CreateCardView() {
  // ----------------------------------------------------------
  // Параметры маршрута и глобальное состояние
  // ----------------------------------------------------------
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

  // Черновик карточки живёт в сторе — переживает переходы на side-editor
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

  // ----------------------------------------------------------
  // Состояния
  // ----------------------------------------------------------
  // «Название из лицевой стороны» — часть черновика в сторе:
  // переживает уход в side-editor и возвращение назад
  const useFrontAsTitle = useCardStore((s) => s.draftUseFrontAsTitle);
  const setUseFrontAsTitle = useCardStore((s) => s.setDraftUseFrontAsTitle);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  // id блоков, подсвеченных красным как пустые
  const [invalidBlockIds, setInvalidBlockIds] = useState<string[]>([]);
  // счётчик попыток сохранения — триггерит тряску
  const [shakeKey, setShakeKey] = useState(0);
  //управление модалкой при выходе
  const [isExitAlertVisible, setIsExitAlertVisible] = useState(false);

  // ----------------------------------------------------------
  // Производные значения
  // ----------------------------------------------------------
  // Живое значение: пересчитывается при каждом изменении лицевой стороны
  const firstFrontText = getFirstFrontText(front);

  // ----------------------------------------------------------
  // Функции-обработчики
  // ----------------------------------------------------------

  // Есть ли что терять при выходе в режиме создания (для блокировки назад)
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

  // Клик «назад»: из редактирования — к «Просмотру карточки»,
  // из создания — к списку шаблонов (с защитой черновика)
  const handleBack = (): void => {
    if (isEditMode) {
      router.push(`/card/${cardId}?deckId=${id}`);
      return;
    }

    //если поля не сохранены, но пользователь хочет выйти
    if (hasUnsavedChanges()) {
      setIsExitAlertVisible(true);
      return;
    }

    resetDraft();
    router.push(`/decks/${id}/create-card`);
  };

  const handleConfirmExit = (): void => {
    setIsExitAlertVisible(false);
    resetDraft();
    router.push(`/decks/${id}/create-card`);
  };

  const handleCancelExit = (): void => {
    setIsExitAlertVisible(false);
  };

  // Глазик в шапке — поп-ап предпросмотра с переворотом
  const handleViewCard = (): void => {
    setIsPreviewVisible(true);
  };

  // Клик на карандаш стороны — переход к редактированию её блоков
  const handleEditSideBlocks = (side: "front" | "back") => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      // cardId пробрасываем, чтобы SideEditor вернул нас в режим редактирования
      params: isEditMode ? { side, cardId } : { side },
    });
  };

  // Включение/выключение «названия из лицевой стороны»
  const handleToggleFrontAsTitle = (): void => {
    if (useFrontAsTitle) {
      // Выключаем: показанный текст остаётся самостоятельным названием
      setUseFrontAsTitle(false);
      if (firstFrontText) setTitle(firstFrontText);
      return;
    }
    // Включить можно только если на лицевой стороне реально есть текст
    if (!firstFrontText) {
      Toast.show({
        type: "error",
        text1: "На лицевой стороне нет текста",
        text2: "Добавьте текст или термин — или введите название вручную",
        position: "bottom",
      });
      return;
    }
    setUseFrontAsTitle(true);
  };

  // Сохранение: создание новой карточки или частичное обновление существующей
  const handleSaveCard = async (): Promise<void> => {
    // Название: из лицевой стороны (там должен быть текст) или вручную
    if (useFrontAsTitle && !firstFrontText) {
      Toast.show({
        type: "error",
        text1: "На лицевой стороне нет текста",
        text2: "Заполните её или снимите галочку и введите название",
        position: "bottom",
      });
      return;
    }
    if (!useFrontAsTitle && !title.trim()) {
      Toast.show({
        type: "error",
        text1: "Заполните название",
        position: "bottom",
      });
      return;
    }

    // Пустые блоки — подсвечиваем красным (errorColor) и трясём
    const emptyIds = [...front, ...back].filter(isBlockEmpty).map((b) => b.id);
    if (emptyIds.length > 0) {
      setInvalidBlockIds(emptyIds);
      setShakeKey((k) => k + 1);
      Toast.show({
        type: "error",
        text1: "Заполните пустые блоки",
        position: "bottom",
      });
      return;
    }
    setInvalidBlockIds([]);

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

      // Название: из первого текстового блока лицевой стороны или вручную
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

      resetDraft();
      // После редактирования возвращаемся к «Просмотру карточки»,
      // после создания — к странице колоды
      router.push(
        isEditMode && cardId ? `/card/${cardId}?deckId=${id}` : `/decks/${id}`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ----------------------------------------------------------
  // Эффекты
  // ----------------------------------------------------------

  // Как только пустой блок заполнили — красная рамка снимается сама
  useEffect(() => {
    setInvalidBlockIds((prev) => {
      if (prev.length === 0) return prev;
      return [...front, ...back]
        .filter((b) => prev.includes(b.id) && isBlockEmpty(b))
        .map((b) => b.id);
    });
  }, [front, back]);

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
        // Галочка «название из лицевой» восстанавливается, если сохранённое
        // название совпадает с текстом первого текстового блока
        const savedFrontText = getFirstFrontText(card.front ?? []);
        setUseFrontAsTitle(
          savedFrontText !== "" && card.title === savedFrontText,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  // ----------------------------------------------------------
  // Рендер
  // ----------------------------------------------------------
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
              {isEditMode ? "Редактирование карточки" : "Создание карточки"}
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
              // При включённой галочке поле показывает живой текст лицевой стороны
              value={useFrontAsTitle ? firstFrontText : title}
              onChangeText={setTitle}
              editable={!useFrontAsTitle}
            />

            <Pressable
              style={styles.checkboxContainer}
              onPress={handleToggleFrontAsTitle}
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
                    <ShakeableBlock
                      key={block.id}
                      isInvalid={invalidBlockIds.includes(block.id)}
                      shakeKey={shakeKey}
                    >
                      <Typography variant="span" color={colors.darkGray}>
                        {getBlockTypeName(block)}
                      </Typography>
                    </ShakeableBlock>
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
                    <ShakeableBlock
                      key={block.id}
                      isInvalid={invalidBlockIds.includes(block.id)}
                      shakeKey={shakeKey}
                    >
                      <Typography variant="span" color={colors.darkGray}>
                        {getBlockTypeName(block)}
                      </Typography>
                    </ShakeableBlock>
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

      <CustomAlert
        visible={isExitAlertVisible}
        message="Выйти без сохранения?"
        description="Изменения не запишутся, и создаваемая карточка будет удалена"
        confirmText="Выйти"
        cancelText="Вернуться к редактированию"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        icon={<LogoSadStar size={160} />}
      />
    </View>
  );
}
