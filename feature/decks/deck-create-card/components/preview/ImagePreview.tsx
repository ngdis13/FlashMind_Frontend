
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Typography } from "@/styles/Typography";
import { useCardScale } from "@/utils/hooks/useCardScale";
import type { ImageBlock } from "../../types/cardBlocks";
import type { PreviewBlockContext } from "./types";

interface ImagePreviewProps {
  block: ImageBlock;
  context: PreviewBlockContext;
}

// Превью картинки: сохраняет ориентацию из кропа, центрируется в карточке
export const ImagePreview: React.FC<ImagePreviewProps> = ({ block }) => {
  const { scaled } = useCardScale();
  const [aspect, setAspect] = useState<number>(4 / 3);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    if (!block.url) return;
    let active = true;
    Image.getSize(
      block.url,
      (w, h) => {
        if (active && w > 0 && h > 0) setAspect(w / h);
      },
      () => {},
    );
    return () => {
      active = false;
    };
  }, [block.url]);

  // Потолок высоты внутри карточки, чтобы картинка не вытеснила текст.
  // Растёт вместе с карточкой: 260 → 351 на десктопе
  const MAX_H = scaled(260);
  const w = containerW ? Math.min(containerW, MAX_H * aspect) : 0;
  const h = w / aspect;

  if (!block.url) {
    return (
      <Typography variant="h3" style={styles.placeholderText}>
        [Изображение не загружено]
      </Typography>
    );
  }

  return (
    <View
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
      style={styles.wrapper}
    >
      <Image
        source={{ uri: block.url }}
        style={{ width: w, height: h, borderRadius: 16, resizeMode: "cover" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%", alignItems: "center" },
  placeholderText: {
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
  },
});
