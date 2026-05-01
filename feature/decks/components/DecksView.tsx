import { colors } from "@/styles/Colors";
import { Typography } from "@/styles/Typography";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import editButton from "../assets/editButton.png";

interface DecksViewProps {
  title: string;
  cardCount: number;
  cardCountNow: number;
  onEditPress: () => void;
  onCardPress: () => void;
  index: number;
}

const randomColors = [
  colors.red,
  colors.orange,
  colors.yellow,
  colors.green,
  colors.blue,
  colors.purple,
];

export default function DecksView({
  title,
  cardCount,
  cardCountNow,
  onEditPress,
  onCardPress,
  index,
}: DecksViewProps) {
  const stripeColor = randomColors[index % randomColors.length];
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={(e) => {
        e.stopPropagation(); 
        onEditPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.up, { backgroundColor: stripeColor }]} />
      <View style={styles.content}>
        <Typography variant="h2" numberOfLines={2}>
          {title}
        </Typography>
      </View>
      <View style={styles.countsContainer}>
        <Typography
          variant="h3"
          color={colors.darkGray}
          style={{ marginBottom: 8 }}
        >
          {cardCount} карточек
        </Typography>

        <View style={styles.bottom}>
          <View style={[[styles.countBadge], { backgroundColor: stripeColor }]}>
            <Typography
              variant="h3"
              color={colors.white}
              style={styles.extraCountText}
            >
              {cardCountNow}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // На всякий случай предотвращаем всплытие
              onEditPress();
            }}
          >
            <View
              style={[
                [styles.countBadgeEdit],
                { backgroundColor: stripeColor },
              ]}
            >
              <Image
                source={editButton}
                style={{ width: 12, height: 12 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  up: {
    position: "absolute", // Прижимаем к верху карточки
    top: 0,
    left: 0,
    right: 0,
    height: 15, // Высота полоски
    width: "100%",
  },
  card: {
    flex: 1,
    maxWidth: 182,
    minHeight: 122,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderColor: colors.lightGray,
    borderWidth: 2,
    overflow: "hidden",
  },
  countsContainer: {
    flexDirection: "column",
    alignSelf: "stretch",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingTop: 23,
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
    width: "100%",
    justifyContent: "space-between",
  },

  countBadge: {
    width: 44,
    height: 18,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeEdit: {
    width: 24,
    height: 18,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    fontSize: 16,
    marginHorizontal: 8,
    color: "#CCCCCC",
  },
  extraCountText: {},
  editButton: {
    padding: 8,
    marginLeft: 12,
  },
  editIcon: {
    fontSize: 20,
  },
  bottom: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
