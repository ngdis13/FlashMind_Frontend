// feature-decks/deck-create-card/screens/SideEditor.tsx
import { ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { CardBlock } from "../types/cardBlocks";
import { useCardStore } from "@/store/card.store";
import { TermBlock } from "../components/blocks/TermBlock";
import { TextBlock } from "../components/blocks/TextBlock";
import { AddBlockBottomSheet } from "../components/AddBlockBottomSheet";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import viewCardIcon from "@/feature-decks/assets/viewCardIcon.png";
import { MainButton } from "@/components/MainButton";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { PreviewModal } from "../components/PreviewModal";

export const SideEditor = () => {
  const router = useRouter();
  const { id, side } = useLocalSearchParams<{ id: string; side: string }>();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // Достаем данные и экшены из нашего стора
  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);
  const addDraftBlock = useCardStore((s) => s.addDraftBlock);
  const removeDraftBlock = useCardStore((s) => s.removeDraftBlock); // Кнопка корзины

  const isFront = side === "front";
  const title = isFront ? "Лицевая сторона" : "Обратная сторона";
  const blocks = isFront ? front : back;
  const sideKey: "front" | "back" = isFront ? "front" : "back";

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Сторона считается заполненной, если есть хотя бы один блок
  const hasBlocks = blocks.length > 0;

  const handleBack = (): void => {
    router.push(`/decks/${id}/create-card/create`);
  };

  const handleViewCard = (): void => {
    if (!hasBlocks) return; // пустую сторону смотреть нечего
    setIsPreviewVisible(true); // Включаем поп-ап превью по нажатию на глазик в шапке!
  };

  const handleEditBlock = (block: CardBlock): void => {
    // 1. Вычисляем имя роута на основе типа блока
    let route = "text-editor";
    if (block.type === "term") route = "term-editor";
    if (block.type === "image") route = "image-editor";

    // 2. Делаем роутинг на нужный экран-редактор
    router.push({
      pathname: `/decks/${id}/create-card/${route}`,
      params: { side, blockId: block.id },
    });
  };

  const handleSelectBlockType = (type: CardBlock["type"]): void => {
    const blocks = sideKey === "front" ? front : back;
    const baseBlock = {
      id: `${type}_${Date.now()}`,
      type,
      value: "",
      position: blocks.length, // Обязательное поле для типов блоков
    };

    // Для специфичных типов блоков добавляем их дефолтные поля
    let finalizedBlock: CardBlock;
    if (type === "quiz") {
      finalizedBlock = {
        ...baseBlock,
        type: "quiz",
        variants: ["", "", "", ""],
        correctIndex: 0,
      };
    } else if (type === "image") {
      finalizedBlock = { ...baseBlock, type: "image", url: "" };
    } else {
      finalizedBlock = baseBlock as CardBlock;
    }

    addDraftBlock(sideKey, finalizedBlock);
    setIsBottomSheetVisible(false);
  };

  const renderBlock = (block: CardBlock) => {
    if (block.type === "term") {
      return (
        <TermBlock
          key={block.id}
          id={block.id}
          value={block.value}
          onEdit={() => handleEditBlock(block)}
          onDelete={() => removeDraftBlock(sideKey, block.id)}
        />
      );
    }
    if (block.type === "text") {
      return (
        <TextBlock
          key={block.id}
          id={block.id}
          value={block.value}
          onEdit={() => handleEditBlock(block)}
          onDelete={() => removeDraftBlock(sideKey, block.id)}
        />
      );
    }

    // ИСПРАВЛЕННЫЙ БЛОК: теперь тут рендерится правильный ImageBlock
    if (block.type === "image") {
      return (
        <ImageBlock
          key={block.id}
          id={block.id}
          url={block.url || ""} // Передаем url картинки из стора
          onEdit={() => handleEditBlock(block)}
          onDelete={() => removeDraftBlock(sideKey, block.id)}
        />
      );
    }
    return null;
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
        >
          {/* Шапка экрана с рабочим глазиком */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={20}
            >
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">{title}</Typography>
            <Pressable
              onPress={handleViewCard}
              style={[
                styles.viewCardButton,
                !hasBlocks && styles.viewCardButtonDisabled,
              ]}
              disabled={!hasBlocks}
              hitSlop={20}
            >
              <Image source={viewCardIcon} style={{ width: 24, height: 24 }} />
            </Pressable>
          </View>

          {/* Список блоков */}
          {blocks.length > 0 && (
            <View style={styles.blocksList}>{blocks.map(renderBlock)}</View>
          )}
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
            style={styles.addBlockButton}
            title="Добавить блок"
            onPress={() => setIsBottomSheetVisible(true)}
          />
        </View>
      </View>

      <AddBlockBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onSelectBlockType={handleSelectBlockType}
      />


      <PreviewModal
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        frontBlocks={front}
        backBlocks={back}
        allowFlip={false}
        initialSide={isFront ? "front" : "back"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: { position: "absolute", left: -20, padding: 20 },
  viewCardButton: { position: "absolute", right: -20, padding: 20 },
  viewCardButtonDisabled: { opacity: 0.4 }, // приглушённый глазик для пустой стороны
  blocksList: { width: "100%", gap: 16 },
  addBlockButton: { width: "100%" },
});
