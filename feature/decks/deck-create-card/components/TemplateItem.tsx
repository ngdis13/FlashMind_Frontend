// feature-decks/deck-create-card/components/TemplateItem.tsx
import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { AppEmojis } from "@/assets/emoji/emoji";
import { CardBlock } from "../types/cardBlocks";

// Описываем форму данных для одного шаблона карточки
export interface TemplateCardMock {
  id: string;
  title: string;
  front: CardBlock[];
  back: CardBlock[];
}

interface TemplateItemProps {
  item: TemplateCardMock;
  onPress: (id: string) => void;
}

const blockLabel = (block: CardBlock): string => {
  switch (block.type) {
    case "term":
      return "Термин";
    case "text":
      return "Текст";
    case "quiz":
      return "Тест";
    case "image":
      return "Изображение";
  }
};

export const TemplateItem: React.FC<TemplateItemProps> = ({ item, onPress }) => {
  // Собираем текстовое превью того, из чего состоит шаблон
  const frontStructure = item.front.map(blockLabel).join(", ");
  const backStructure = item.back.map(blockLabel).join(", ");

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.content}>
        <Image
          source={AppEmojis.document}
          style={styles.inlineEmoji}
          resizeMode="contain"
        />
        <View style={styles.itemInfo}>
          <Typography variant="span" style={styles.title}>
            {item.title}
          </Typography>
          <Typography variant="h3" style={styles.subtitle} color={colors.darkGray}>
            Лицевая: {frontStructure || "пустая"}
          </Typography>
          <Typography variant="h3" style={styles.subtitle} color={colors.darkGray}>
            Обратная: {backStructure || "пустая"}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 2,
  },
  inlineEmoji: {
    width: 20,
    height: 20,
  },
  itemInfo: {},
});
