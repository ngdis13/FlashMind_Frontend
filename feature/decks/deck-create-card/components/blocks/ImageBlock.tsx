// feature-decks/deck-create-card/components/blocks/ImageBlock.tsx
import React from "react";
import { View, Pressable, StyleSheet, Image } from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { commonStyles } from "@/styles/Common";

import deleteIcon from "@/assets/icons/DeleteIcon.png";
import editIcon from "@/assets/icons/editIcon2.png"; // Используем твою иконку как плейсхолдер

interface ImageBlockProps {
  id: string;
  url: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  url,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={[styles.card, commonStyles.shadowBox]}>
      {/* Сиреневая шапка блока */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Typography variant="h2" color={colors.white}>
            ⋮⋮
          </Typography>
          <Typography variant="h2" color={colors.white}>
            Изображение
          </Typography>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={onEdit} hitSlop={10}>
            <Image source={editIcon} style={{ width: 27, height: 18 }} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={10}>
            <Image source={deleteIcon} style={{ width: 18, height: 18 }} />
          </Pressable>
        </View>
      </View>

      {/* Область контента */}
      <View style={styles.content}>
        {url ? (
          <Image source={{ uri: url }} style={styles.previewImage} />
        ) : (
          <Typography variant="h3" style={styles.placeholderText}>
            Нажмите на карандаш, чтобы загрузить изображение...
          </Typography>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.mainColor,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  content: {
    padding: 16,
    minHeight: 50,
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },

  placeholderText: {
    color: colors.darkGray,
    fontStyle: "italic",
  },
});
