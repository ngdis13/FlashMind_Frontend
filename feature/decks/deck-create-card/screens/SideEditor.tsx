import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback, useRef, useEffect } from "react";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import Animated, {
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { CardBlock } from "../types/cardBlocks";
import { useCardStore } from "@/store/card.store";
import { AddBlockBottomSheet } from "../components/AddBlockBottomSheet";
import { CardBlockItem } from "../components/CardBlockItem";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import viewCardIcon from "@/feature-decks/assets/viewCardIcon.png";
import { MainButton } from "@/components/MainButton";
import { PreviewModal } from "../components/PreviewModal";
import React from "react";

const isWeb = Platform.OS === "web";

interface MobileListProps {
  blocks: CardBlock[];
  sideKey: "front" | "back";
  onEdit: (block: CardBlock) => void;
  onDelete: (blockId: string) => void;
  onMove: (side: "front" | "back", blocks: CardBlock[]) => void;
}

const MobileDraggableList: React.FC<MobileListProps> = ({
  blocks,
  sideKey,
  onEdit,
  onDelete,
  onMove,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<CardBlock>) => (
      <ScaleDecorator activeScale={1.03}>
        <CardBlockItem
          item={item}
          drag={drag}
          isActive={isActive}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      </ScaleDecorator>
    ),
    [onEdit, onDelete],
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: CardBlock[] }) => {
      setIsDragging(false);
      onMove(sideKey, data);
    },
    [onMove, sideKey],
  );

  return (
    <DraggableFlatList
      data={blocks}
      keyExtractor={(item: CardBlock) => item.id}
      onDragBegin={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      renderItem={renderItem}
      containerStyle={{ flex: 1, width: "100%" }}
      contentContainerStyle={{
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 30,
      }}
      showsVerticalScrollIndicator={false}
      activationDistance={15}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!isDragging}
    />
  );
};

export const SideEditor = () => {
  const router = useRouter();
  const { id, side } = useLocalSearchParams<{ id: string; side: string }>();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);
  const addDraftBlock = useCardStore((s) => s.addDraftBlock);
  const removeDraftBlock = useCardStore((s) => s.removeDraftBlock);
  const moveDraftBlock = useCardStore((s) => s.moveDraftBlock);

  const isFront = side === "front";
  const title = isFront ? "Лицевая сторона" : "Обратная сторона";
  const blocks = isFront ? front : back;
  const sideKey: "front" | "back" = isFront ? "front" : "back";

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const hasBlocks = blocks.length > 0;

  // Reanimated shared values — работают на UI-потоке, 60fps, без ререндера
  const draggedIndexSV = useSharedValue(-1);
  const dragOffsetSV = useSharedValue(0);
  const dragTargetSV = useSharedValue(-1);

  // JS-рефы для pointer events (не шарятся с UI-потоком)
  const cardRefs = useRef<(View | null)[]>([]);
  const dragStartYRef = useRef(0);
  const cardHeightRef = useRef(0);
  const blockCountRef = useRef(0);
  const blocksSnapshotRef = useRef<CardBlock[]>([]);

  // Единственный JS-стейт для ререндера
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const BLOCK_GAP = 16;
  const SPRING_CONFIG = { damping: 30, stiffness: 150 };

  const handleBack = (): void => {
    router.push(`/decks/${id}/create-card/create`);
  };

  const handleViewCard = (): void => {
    if (!hasBlocks) return;
    setIsPreviewVisible(true);
  };

  const handleEditBlock = (block: CardBlock): void => {
    let route = "text-editor";
    if (block.type === "term") route = "term-editor";
    if (block.type === "image") route = "image-editor";

    router.push({
      pathname: `/decks/${id}/create-card/${route}`,
      params: { side, blockId: block.id },
    });
  };

  const handleSelectBlockType = (type: CardBlock["type"]): void => {
    const currentBlocks = sideKey === "front" ? front : back;
    const baseBlock = {
      id: `${type}_${Date.now()}`,
      type,
      value: "",
      position: currentBlocks.length,
    };

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

  // ===== WEB: translateY-подход — блоки реально двигаются, массив не трогаем =====
  useEffect(() => {
    if (!isWeb) return;

    const handlePointerMove = (e: PointerEvent) => {
      const di = draggedIndexSV.value;
      if (di < 0) return;
      e.preventDefault();

      const step = cardHeightRef.current + BLOCK_GAP;
      if (step <= 0) return;

      const offsetY = e.clientY - dragStartYRef.current;
      dragOffsetSV.value = offsetY;

      const delta = Math.round(offsetY / step);
      const target = Math.max(
        0,
        Math.min(blockCountRef.current - 1, di + delta),
      );
      dragTargetSV.value = target;
    };

    const handlePointerUp = () => {
      const di = draggedIndexSV.value;
      const target = dragTargetSV.value;

      if (di >= 0 && target >= 0 && di !== target) {
        const snapshot = blocksSnapshotRef.current;
        if (snapshot.length > 0) {
          const newBlocks = [...snapshot];
          const [moved] = newBlocks.splice(di, 1);
          newBlocks.splice(target, 0, moved);
          moveDraftBlock(sideKey, newBlocks);
        }
      }

      draggedIndexSV.value = -1;
      dragOffsetSV.value = 0;
      dragTargetSV.value = -1;
      setDraggedIndex(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isWeb, moveDraftBlock, sideKey]);

  const handlePointerDown = useCallback(
    (index: number, clientY: number) => {
      draggedIndexSV.value = index;
      dragOffsetSV.value = 0;
      dragTargetSV.value = index;
      dragStartYRef.current = clientY;
      setDraggedIndex(index);

      const currentBlocks = sideKey === "front" ? front : back;
      blocksSnapshotRef.current = [...currentBlocks];
      blockCountRef.current = currentBlocks.length;

      const firstCard = cardRefs.current[0] as unknown as HTMLElement | null;
      if (firstCard && cardHeightRef.current === 0) {
        cardHeightRef.current = firstCard.getBoundingClientRect().height;
      }
    },
    [sideKey, front, back],
  );

  const DraggableBlock: React.FC<{ block: CardBlock; index: number }> =
    React.memo(({ block, index: idx }) => {
      const animatedStyle = useAnimatedStyle(() => {
        const di = draggedIndexSV.value;
        if (di < 0) return {};

        const cardH = cardHeightRef.current + BLOCK_GAP;
        const target = dragTargetSV.value;

        if (idx === di) {
          return {
            transform: [{ translateY: dragOffsetSV.value }],
            zIndex: 100,
          };
        }

        if (di < idx && idx <= target) {
          return {
            transform: [{ translateY: withSpring(-cardH, SPRING_CONFIG) }],
          };
        }
        if (target <= idx && idx < di) {
          return {
            transform: [{ translateY: withSpring(cardH, SPRING_CONFIG) }],
          };
        }

        return { transform: [{ translateY: withSpring(0, SPRING_CONFIG) }] };
      });

      return (
        <Animated.View
          key={block.id}
          layout={
            draggedIndex !== null ? undefined : LinearTransition.duration(400)
          }
          ref={(el) => {
            cardRefs.current[idx] = el as unknown as View;
          }}
          style={animatedStyle}
        >
          <CardBlockItem
            item={block}
            index={idx}
            isDragged={draggedIndex === idx}
            isDragOver={false}
            onPointerDown={() => {
              const el = cardRefs.current[idx] as unknown as HTMLElement | null;
              const rect = el?.getBoundingClientRect();
              handlePointerDown(idx, rect?.top ?? 0);
            }}
            onEdit={() => handleEditBlock(block)}
            onDelete={() => removeDraftBlock(sideKey, block.id)}
          />
        </Animated.View>
      );
    });
  DraggableBlock.displayName = "DraggableBlock";
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        {/* Шапка экрана со статичным заголовком стороны и рабочим "глазиком" превью */}
        <View style={styles.headerWrapper}>
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
        </View>

        {/* Разделение рендеринга списков в зависимости от платформы окружения */}
        {isWeb ? (
          // WEB-ВЕРСИЯ: ScrollView + Кастомный Pointer Drag-and-Drop с физикой пружин Reanimated
          <ScrollView
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {blocks.map((block, index) => (
              <DraggableBlock key={block.id} block={block} index={index} />
            ))}
          </ScrollView>
        ) : (
          // МОБИЛЬНАЯ ВЕРСИЯ (iOS/Android): Высокопроизводительный нативный DraggableFlatList
          <MobileDraggableList
            blocks={blocks}
            sideKey={sideKey}
            onEdit={handleEditBlock}
            onDelete={(blockId: string) => removeDraftBlock(sideKey, blockId)}
            onMove={moveDraftBlock}
          />
        )}

        {/* Фиксированная нижняя кнопка вызова шторки добавления новых блоков */}
        <View style={styles.bottomButtonContainer}>
          <MainButton
            style={styles.addBlockButton}
            title="Добавить блок"
            onPress={() => setIsBottomSheetVisible(true)}
          />
        </View>
      </View>

      {/* Шторка выбора типа добавляемого блока */}
      <AddBlockBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onSelectBlockType={handleSelectBlockType}
        allowedTypes={
          sideKey === "front" 
            ? ["term", "text", "image"] 
            : ["text", "image"]
        }
      />

      {/* Модальное окно полноэкранного интерактивного превью создаваемой карточки */}
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
  headerWrapper: { width: "100%", paddingHorizontal: 10, paddingTop: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: { position: "absolute", left: -10, top: 0, padding: 10 },
  viewCardButton: { position: "absolute", right: -10, top: 0, padding: 10 },
  viewCardButtonDisabled: { opacity: 0.4 },
  listContent: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 30 },
  draggedCard: {
    zIndex: 100,
  },
  bottomButtonContainer: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: BOTTOM_MARGIN,
  },
  addBlockButton: { width: "100%" },
});
