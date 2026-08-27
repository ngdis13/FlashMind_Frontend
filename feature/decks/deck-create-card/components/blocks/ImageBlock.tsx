// feature-decks/deck-create-card/components/blocks/ImageBlock.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

interface ImageBlockProps {
  url: string;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ url }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(16/9);
  const [containerWidth, setContainerWidth] = useState(0);

  const MAX_IMAGE_HEIGHT = 200;

  const displayWidth = containerWidth
    ? Math.min(containerWidth, MAX_IMAGE_HEIGHT * aspectRatio)
    : 0;
  const displayHeight = displayWidth / aspectRatio;

  useEffect(() => {
    if (!url) return;
    let isActive = true;

    Image.getSize(
      url, 
      (width, height) => {
        if (isActive && width > 0 && height > 0) {
          setAspectRatio(width/height);
        }
      },
      () => {}
    );
    return () => {
      isActive = false;
    };
  }, [url]);

  return (
    <View
      style={styles.content}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {url ? (
        <View
          style={[
            styles.imageWrapper,
            { width: displayWidth, height: displayHeight },
          ]}
        >
          <Image source={{ uri: url }} style={styles.previewImage} />
        </View>
      ) : (
        <Typography variant="h3" style={styles.placeholderText}>
          Нажмите на карандаш, чтобы загрузить изображение...
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    minHeight: 50,
    justifyContent: "center",
  },
  imageWrapper: {
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderText: {
    color: colors.darkGray,
    fontStyle: "italic",
  },
});
