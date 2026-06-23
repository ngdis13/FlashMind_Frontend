import { colors } from "@/styles/Colors";
import { Typography } from "@/styles/Typography";
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import IconDownload from '../assets/IconDownload.png';

interface CloudDeckViewProps {
  title: string;
  author: string;
  updatedAt: string;
  cardsCount: number;
  downloadsCount: string;
  avatarUrl?: string;
  onPress?: () => void;
}

export default function CloudDeckView({
  title,
  author,
  updatedAt,
  cardsCount,
  downloadsCount,
  avatarUrl,
  onPress,
}: CloudDeckViewProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Верхняя фиолетовая плашка */}
      <View style={styles.topBadge}>
        <Image source={IconDownload} style={{ width: 8, height: 10 }} />
        <Typography style={styles.downloadsText}>{downloadsCount}</Typography>
      </View>

      {/* Контентная часть фиксированной высоты */}
      <View style={styles.cardContent}>
        {/* Название колоды максимум в 2 строки с многоточием */}
        <Typography 
          variant={"h2"} 
          style={styles.title} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {title}
        </Typography>

        {/* Нижняя строка: автор и количество */}
        <View style={styles.footerRow}>
          <View style={styles.authorBlock}>
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("../assets/default-avatar.png")
              }
              style={styles.avatar}
            />
            <View style={styles.authorTexts}>
              <Typography style={styles.authorName} numberOfLines={1} ellipsizeMode="tail">
                {author}
              </Typography>
              <Typography style={styles.updatedText}>
                Обновлено: {updatedAt}
              </Typography>
            </View>
          </View>

          <Typography style={styles.cardsCount}>
            {cardsCount} карточек
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#CDCDCD",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  topBadge: {
    height: 20,
    backgroundColor: colors.mainColor,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 4,
  },
  downloadsText: {
    color: "#FFFFFF",
    fontSize: 10,
  },
  cardContent: {
    height: 102, 
    padding: 12,
    paddingTop: 10,
    justifyContent: "space-between",  
  },
  title: {
    maxHeight: 40, 
    marginBottom: 0, 
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end", 
    width: "100%",
  },
  authorBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13, 
    backgroundColor: "#E0E0E0",
  },
  authorTexts: {
    marginLeft: 8,
    justifyContent: "center",
    flex: 1, 
  },
  authorName: {
    fontSize: 12,
  },
  updatedText: {
    fontSize: 10,
    color: colors.darkGray,
    marginTop: 2,
  },
  cardsCount: {
    fontSize: 12,
    paddingLeft: 8,
  },
});
