// --------------------------- React ---------------------------
import React, { useState } from "react";

// --------------------------- React Native ---------------------------
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Pressable,
} from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";

// --------------------------- Компоненты ---------------------------
import { CustomAlert } from "@/components/CustomAlert";
import { LogoSadStar } from "@/components/LogoSadStar";

// --------------------------- Ассеты ---------------------------
import DeleteIcon from "@/assets/icons/DeleteIcon.png";

interface CardItemProps {
  id: string;
  front: string;
  back?: string;
  deckId?: string;
  index?: number;
  difficulty?: number;
  viewMode?: "compact" | "expanded";
  onPress?: (id: string, deckId?: string) => void;
  onDelete: (id: string, deckId?: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Убирает HTML-теги, оставляя только чистый текст (для превью в списке)
 */
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(div|p|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

export const CardItem = ({
  id,
  front,
  back,
  deckId,
  index,
  difficulty,
  viewMode = "compact",
  onPress,
  onDelete,
  style,
}: CardItemProps) => {
  const [alertVisible, setAlertVisible] = useState<boolean>(false);

  const getBorderColor = (diff: number | string | null | undefined): string => {
    if (diff === "none" || diff === null || diff === undefined || diff === "") {
      return "#DBDBDB";
    }
    const numericDiff = Number(diff);
    if (isNaN(numericDiff)) {
      return "#DBDBDB";
    }
    if (numericDiff <= 3) return "#7EE083";
    if (numericDiff <= 8) return "#FFC39B";
    return "#FB8B93";
  };

  const handlePress = (): void => {
    onPress?.(id, deckId);
  };

  const handleDeletePress = (): void => {
    setAlertVisible(true);
  };

  const handleConfirmDelete = (): void => {
    setAlertVisible(false);
    onDelete?.(id, deckId);
  };

  const handleCancelDelete = (): void => {
    setAlertVisible(false);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, { borderColor: getBorderColor(difficulty) }, style]}
    >
      <View style={styles.textContainer}>
        <Typography variant="h2" numberOfLines={2}>
          {stripHtml(front)}
        </Typography>
      </View>

      <Pressable
        onPress={handleDeletePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.deleteButton}
      >
        <Image source={DeleteIcon} style={styles.deleteIcon} />
      </Pressable>

      <CustomAlert
        visible={alertVisible}
        message="Ты действительно хочешь удалить карточку?"
        confirmText="Удалить"
        cancelText="Вернуться к карточкам"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        icon={<LogoSadStar size={128} />}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  textContainer: {
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
});
