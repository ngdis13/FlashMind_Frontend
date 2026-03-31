import { Typography } from "@/styles/Typography";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Pressable,
} from "react-native";
import DeleteIcon from "@/assets/icons/DeleteIcon.png";

interface CardItemProps {
  id: string;
  front: string;
  back?: string;
  deckId?: string;
  index?: number;
  viewMode?: "compact" | "expanded" | "preview";
  onPress?: (id: string, deckId?: string) => void;
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
  style,
}: CardItemProps) => {
  const handlePress = () => {
    onPress?.(id, deckId);
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Typography variant="h2" numberOfLines={2}>
          {front}
        </Typography>

        {back && (
          <Typography variant="h2" numberOfLines={2}>
            {back}
          </Typography>
        )}

        <Pressable>
          <Image source={DeleteIcon} style={{ width: 18, height: 18 }} />
        </Pressable>
      </View>
    </TouchableOpacity>
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

    // тень под карточкой (как у инпута)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // выравниваем по центру по вертикали
    flex: 1, // занимает всё доступное пространство
  },
});
