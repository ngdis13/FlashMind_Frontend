// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";

interface CardItemProps {
  id: string;
  title: string;
  deckId?: string;
  difficulty?: number;
  onPress?: (id: string, deckId?: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Цвет рамки по сложности (v2.0.0: difficulty — число FSRS)
 */
const getBorderColor = (diff: number | null | undefined): string => {
  if (diff === null || diff === undefined) return "#DBDBDB";
  if (diff <= 3) return "#7EE083";
  if (diff <= 8) return "#FFC39B";
  return "#FB8B93";
};

export const CardItem = ({
  id,
  title,
  deckId,
  difficulty,
  onPress,
  style,
}: CardItemProps) => {
  const handlePress = (): void => {
    onPress?.(id, deckId);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, { borderColor: getBorderColor(difficulty) }, style]}
    >
      <View style={styles.textContainer}>
        <Typography variant="h2" numberOfLines={1}>
          {title}
        </Typography>
      </View>
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
    gap: 4,
  },
});
