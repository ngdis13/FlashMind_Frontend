import { Typography } from "@/styles/Typography";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Pressable,
  Alert,
} from "react-native";
import DeleteIcon from "@/assets/icons/DeleteIcon.png";
import { CustomAlert } from "./CustomAlert";

interface CardItemProps {
  id: string;
  front: string;
  back?: string;
  deckId?: string;
  index?: number;
  viewMode?: "compact" | "expanded" | "preview";
  onPress?: (id: string, deckId?: string) => void;
  onDelete: (id: string, deckId?: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const CardItem = ({
  id,
  front,
  back,
  deckId,
  index,
  viewMode = "compact",
  onPress,
  onDelete,
  style,
}: CardItemProps) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const handlePress = () => {
    onPress?.(id, deckId);
  };
  const handleDeletePress = () => {
    setAlertVisible(true);
  };

  const handleConfirmDelete = () => {
    setAlertVisible(false);
    onDelete?.(id, deckId);
  };

  const handleCancelDelete = () => {
    setAlertVisible(false);
  };

  return (
    <View style={[styles.card, style]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Typography variant="h2" numberOfLines={2}>
              {front}
            </Typography>
          </View>
        </View>
      </TouchableOpacity>

      {/* Кнопка удаления вынесена отдельно, вне TouchableOpacity */}
      <Pressable
        onPress={handleDeletePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Image source={DeleteIcon} style={styles.deleteIcon} />
      </Pressable>

      <CustomAlert
        visible={alertVisible}
        message={`Ты действительно хочешь удалить карточку?`}
        confirmText="Удалить"
        cancelText="Вернуться к карточкам"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DBDBDB",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    width: "100%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: "space-between",
  },
  cardContent: {
    flexDirection: "row",

    alignItems: "center",
    flex: 1,
  },

  deleteIcon: {
    width: 20,
    height: 20,
  },
});
