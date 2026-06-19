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
import { CustomAlert } from "@/components/CustomAlert";
import { LogoSadStar } from "@/components/LogoSadStar";

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
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.7}
      style={[styles.card, style]}
    >
      <View style={styles.textContainer}>
        <Typography variant="h2" numberOfLines={2}>
          {front}
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
    borderColor: "#DBDBDB",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  textContainer: {
    flex: 1,
  },
  deleteButton: {
    padding: 4, // Увеличивает область клика внутри карточки
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
});
