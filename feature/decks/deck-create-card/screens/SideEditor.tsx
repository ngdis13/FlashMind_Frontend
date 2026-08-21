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

export const SideEditor = () => {
  const router = useRouter();
  const { id, side } = useLocalSearchParams<{ id: string; side: string }>();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);
  const addDraftBlock = useCardStore((s) => s.addDraftBlock);

  const isFront = side === "front";
  const title = isFront ? "Лицевая сторона" : "Обратная сторона";
  const blocks = isFront ? front : back;

  const handleBack = (): void => {
    router.back();
  };

  const handleViewCard = (): void => {};

  const handleEditBlock = (block: CardBlock): void => {
    const route = block.type === "term" ? "term-editor" : "text-editor";
    router.push({
      pathname: `/decks/${id}/create-card/${route}`,
      params: { side, blockId: block.id },
    });
  };

  const handleAddBlock = (): void => {
    setIsBottomSheetVisible(true);
  };

  const handleSelectBlockType = (type: CardBlock["type"]): void => {
    let newBlock: CardBlock;

    switch (type) {
      case "term":
        newBlock = {
          id: `${type}_${Date.now()}`,
          type: "term",
          position: blocks.length,
          value: "",
        };
        break;
      case "text":
        newBlock = {
          id: `${type}_${Date.now()}`,
          type: "text",
          position: blocks.length,
          value: "",
        };
        break;
      case "image":
        newBlock = {
          id: `${type}_${Date.now()}`,
          type: "image",
          position: blocks.length,
          url: "",
        };
        break;
      case "quiz":
        newBlock = {
          id: `${type}_${Date.now()}`,
          type: "quiz",
          position: blocks.length,
          variants: ["", "", "", ""],
          correctIndex: 0,
        };
        break;
      default:
        return;
    }
    
    addDraftBlock(isFront ? "front" : "back", newBlock);
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
          onDelete={() => {}}
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
          onDelete={() => {}}
        />
      );
    }
    if (block.type === "image") {
      return (
        <TextBlock
          key={block.id}
          id={block.id}
          value={block.url || "Нет изображения"}
          onEdit={() => handleEditBlock(block)}
          onDelete={() => {}}
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
              style={styles.viewCardButton}
              hitSlop={20}
            >
              <Image source={viewCardIcon} style={{ width: 24, height: 24 }} />
            </Pressable>
          </View>

          {/* Просто рендерим блоки, если они есть */}
          {blocks.length > 0 && (
            <View style={styles.blocksList}>
              {blocks.map(renderBlock)}
            </View>
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
            onPress={handleAddBlock}
          />
        </View>
      </View>

      <AddBlockBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onSelectBlockType={handleSelectBlockType}
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
  backButton: {
    position: "absolute",
    left: -20,
    padding: 20,
  },
  viewCardButton: {
    position: "absolute",
    right: -20,
    padding: 20,
  },
  blocksList: {
    width: "100%",
    gap: 16,
  },
  addBlockButton: {
    width: "100%",
  },
});