
import React from "react";
import { View, StyleSheet, Pressable, Image, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/styles/Colors";
import { Typography } from "@/styles/Typography";
import { commonStyles } from "@/styles/Common";

import deleteIcon from "@/assets/icons/DeleteIcon.png";
import editIcon from "@/assets/icons/editIcon2.png";
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

    // Содержимое шапки — общее для веба и мобильных
    const headerInner = (
      <>
        <View style={styles.headerLeft}>
          <Typography variant="h2" color={colors.white}>
            ⋮⋮
          </Typography>
          <Typography variant="h2" color={colors.white}>
            {item.type === "text" && "Текст"}
            {item.type === "image" && "Изображение"}
          </Typography>
        </View>

        {/* Кнопки правки/удаления не должны запускать перетаскивание:
            на вебе глушим всплытие pointerdown, на мобилках вложенные
            Pressable и так перехватывают нажатие */}
        <View
          style={styles.headerActions}
          onPointerDown={isWeb ? (e) => e.stopPropagation() : undefined}
        >
          <Pressable onPress={onEdit} hitSlop={10}>
            <Image source={editIcon} style={{ width: 27, height: 18 }} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={10}>
            <Image source={deleteIcon} style={{ width: 18, height: 18 }} />
          </Pressable>
        </View>
      </>
    );

    return (
      <View
        style={[
          styles.card,
          commonStyles.shadowBox,
          (isActive || isDragged) && styles.activeCard,
          webCardStyle,
        ]}
      >
        {isWeb ? (
          // WEB: вся шапка ловит pointerdown для кастомного drag-and-drop
          <View
            style={[styles.header, styles.headerWeb]}
            onPointerDown={(e) => {
              e.preventDefault?.();
              onPointerDown?.();
            }}
          >
            {headerInner}
          </View>
        ) : (
          // МОБИЛЬНЫЕ: вся шапка запускает drag долгим нажатием
          <Pressable
            style={styles.header}
            onLongPress={handleDragActivate}
            delayLongPress={140}
          >
            {headerInner}
          </Pressable>
        )}

        <View style={styles.body}>
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
  headerWeb: { cursor: "grab" } as Record<string, unknown>,
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  body: {
    width: "100%",
  },
});
