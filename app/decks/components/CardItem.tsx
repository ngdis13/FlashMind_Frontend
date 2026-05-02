import { Typography } from "@/styles/Typography";
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Pressable,
} from "react-native";
import DeleteIcon from "@/assets/icons/DeleteIcon.png";
import { CustomAlert } from "./CustomAlert";

interface CardItemProps {
  id: string;
  front: string;
  back?: string;
  deckId?: string;
  index?: number;
  viewMode?: "compact" | "expanded";
  onPress?: (id: string, deckId?: string) => void;
  onDelete: (id: string, deckId?: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const CardItem = ({
  id,
  front,
  deckId,
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

  return (
    <View style={[styles.wrapper, style]}>
      {/* Теперь TouchableOpacity занимает ВСЁ место */}
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.7} 
        style={styles.card}
      >
        <View style={styles.textContainer}>
          <Typography variant="h2" numberOfLines={2}>
            {front}
          </Typography>
        </View>
      </TouchableOpacity>

      {/* Кнопка удаления поверх карточки справа */}
      <Pressable
        onPress={handleDeletePress}
        style={styles.deleteButton}
        hitSlop={15}
      >
        <Image source={DeleteIcon} style={styles.deleteIcon} />
      </Pressable>

      <CustomAlert
        visible={alertVisible}
        message={`Ты действительно хочешь удалить карточку?`}
        confirmText="Удалить"
        cancelText="Вернуться"
        onConfirm={handleConfirmDelete}
        onCancel={() => setAlertVisible(false)}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "relative",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DBDBDB",
    borderRadius: 15,
    paddingVertical: 16, // Увеличил padding для удобства нажатия
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    minHeight: 60,
    // Тени
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    paddingRight: 40, // Отступ, чтобы текст не налезал на корзину
  },
  deleteButton: {
    position: "absolute",
    right: 14,
    top: "50%",
    marginTop: -10, // Центрирование иконки (половина высоты иконки)
    zIndex: 10,
  },
  deleteIcon: {
    width: 20,
    height: 20,
  },
});
