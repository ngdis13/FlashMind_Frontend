// feature-decks/deck-create-card/components/CardBlockItem.tsx
import React from "react";
import { View, StyleSheet, Pressable, Image, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import type { ViewStyle } from "react-native";

import { colors } from "@/styles/Colors";
import { Typography } from "@/styles/Typography";
import { commonStyles } from "@/styles/Common";

import deleteIcon from "@/assets/icons/DeleteIcon.png";
import editIcon from "@/assets/icons/editIcon2.png";
import { TermBlock } from "./blocks/TermBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import type { CardBlock } from "../types/cardBlocks";

interface CardBlockItemProps {
  item: CardBlock;
  onEdit: () => void;
  onDelete: () => void;
  drag?: () => void;
  isActive?: boolean;
  index?: number;
  isDragged?: boolean;
  isDragOver?: boolean;
  onPointerDown?: () => void;
}

const webCardStyle: Record<string, unknown> =
  Platform.OS === "web"
    ? {
        userSelect: "none" as string,
        WebkitUserSelect: "none" as string,
        outline: "none" as string,
        cursor: "default" as string,
      }
    : {};

export const CardBlockItem: React.FC<CardBlockItemProps> = React.memo(
  ({
    item,
    drag,
    isActive,
    onEdit,
    onDelete,
    index: _index,
    isDragged,
    isDragOver: _isDragOver,
    onPointerDown,
  }) => {
    const isWeb = Platform.OS === "web";

    const handleDragActivate = () => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // expo-haptics не работает на web
      }
      drag?.();
    };

    return (
      <View
        style={[
          styles.card,
          commonStyles.shadowBox,
          (isActive || isDragged) && styles.activeCard,
          webCardStyle,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {isWeb ? (
              <View
                onPointerDown={(e) => {
                  e.preventDefault?.();
                  onPointerDown?.();
                }}
                style={[styles.dragHandleWeb, { outline: "none" } as ViewStyle]}
              >
                <Typography variant="h2" color={colors.white}>
                  ⋮⋮
                </Typography>
              </View>
            ) : (
              <Pressable
                onLongPress={handleDragActivate}
                delayLongPress={140}
                hitSlop={12}
              >
                <Typography variant="h2" color={colors.white}>
                  ⋮⋮
                </Typography>
              </Pressable>
            )}
            <Typography variant="h2" color={colors.white}>
              {item.type === "term" && "Термин"}
              {item.type === "text" && "Текст"}
              {item.type === "image" && "Изображение"}
            </Typography>
          </View>

          <View style={styles.headerActions}>
            <Pressable onPress={onEdit} hitSlop={10}>
              <Image source={editIcon} style={{ width: 27, height: 18 }} />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={10}>
              <Image source={deleteIcon} style={{ width: 18, height: 18 }} />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          {item.type === "term" && <TermBlock value={item.value} />}
          {item.type === "text" && <TextBlock value={item.value} />}
          {item.type === "image" && <ImageBlock url={item.url} />}
        </View>
      </View>
    );
  },
);

CardBlockItem.displayName = "CardBlockItem";

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 16,
    // ВАЖНО: возвращаем жесткий overflow для сохранения углов на всех платформах
    overflow: "hidden" as const,
  },
  activeCard: {
    opacity: 0.8,
    backgroundColor: colors.white,
    borderColor: "#E2E2E7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.mainColor,
    paddingHorizontal: 12,
    paddingVertical: 10,
    // На вебе принудительно заставляем края шапки слушаться радиуса карточки
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dragHandleWeb: {
    paddingHorizontal: 4,
    cursor: "grab",
  } as Record<string, unknown>,
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  body: {
    width: "100%",
  },
});
