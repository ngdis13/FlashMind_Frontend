// feature-decks/deck-create-card/components/ImageCropModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { MainButton } from "@/components/MainButton";

interface ImageCropModalProps {
  isVisible: boolean;
  imageUri: string;
  origWidth: number;
  origHeight: number;
  onClose: () => void;
  onConfirm: (croppedUri: string) => void;
}

const CARD_WIDTH = 373;
const FIX_ZONE_SIZE = 300; // Размеры невидимой зоны, защищающей от прыжков

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isVisible,
  imageUri,
  origWidth,
  origHeight,
  onClose,
  onConfirm,
}) => {
  const [aspectRatio, setAspectRatio] = useState<"vertical" | "horizontal">(
    "vertical",
  );

  // ЖЕСТКО ЗАДАЕМ РАЗМЕРЫ БОКСА: Картинка гарантированно отобразится без багов!
  const currentBoxSize = aspectRatio === "vertical"
    ? { width: 225, height: 300 }  // Идеальные пропорции 3:4 внутри зоны 300х300
    : { width: 300, height: 225 }; // Идеальные пропорции 4:3 внутри зоны 300х300

  const handleConfirmCrop = async () => {
    if (!imageUri || !origWidth || !origHeight) return;

    try {
      const targetRatio = aspectRatio === "vertical" ? 3 / 4 : 4 / 3;

      let cropWidth = origWidth;
      let cropHeight = origHeight;

      if (origWidth / origHeight > targetRatio) {
        cropWidth = origHeight * targetRatio;
      } else {
        cropHeight = origWidth / targetRatio;
      }

      cropWidth = Math.floor(cropWidth);
      cropHeight = Math.floor(cropHeight);

      let originX = Math.floor((origWidth - cropWidth) / 2);
      let originY = Math.floor((origHeight - cropHeight) / 2);

      originX = Math.max(0, Math.min(originX, origWidth - cropWidth));
      originY = Math.max(0, Math.min(originY, origHeight - cropHeight));

      const actions = [
        {
          crop: {
            originX,
            originY,
            width: cropWidth,
            height: cropHeight,
          },
        },
        {
          resize: {
            width: 870,
          },
        },
      ];

      const result = await ImageManipulator.manipulateAsync(imageUri, actions, {
        compress: 1.0,
        format: ImageManipulator.SaveFormat.PNG,
      });

      onConfirm(result.uri);
    } catch (error) {
      console.error("Ошибка при выполнении манипуляции кропа:", error);
    }
  };

  if (!imageUri) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popoverCard}>
          {/* Контейнер заголовка */}
          <View style={styles.titleContainer}>
            <Typography variant="h2" style={styles.modalTitle}>
              Выберите, как будет выглядеть ваша картинка
            </Typography>
          </View>

          {/* ЯКОРЬ ПРОТИВ ПРЫЖКОВ КНОПОК */}
          <View style={styles.fixedPreviewZone}>
            <View 
              style={[
                styles.cropperWrapper, 
                { width: currentBoxSize.width, height: currentBoxSize.height } // Передаем жесткие размеры
              ]}
            >
              <Image source={{ uri: imageUri }} style={styles.sourceImage} />
            </View>
          </View>

          {/* Селектор формата */}
          <View style={styles.formatSelector}>
            <Pressable
              style={[aspectRatio === "vertical" && styles.formatBtnActive]}
              onPress={() => setAspectRatio("vertical")}
            >
              <View
                style={[
                  styles.iconRect,
                  styles.iconRectVertical,
                  aspectRatio === "vertical" && styles.iconRectActive,
                ]}
              />
            </Pressable>

            <Pressable
              style={[aspectRatio === "horizontal" && styles.formatBtnActive]}
              onPress={() => setAspectRatio("horizontal")}
            >
              <View
                style={[
                  styles.iconRect,
                  styles.iconRectHorizontal,
                  aspectRatio === "horizontal" && styles.iconRectActive,
                ]}
              />
            </Pressable>
          </View>

          {/* Кнопки действий */}
          <View style={styles.actionContainer}>
            <MainButton
              style={styles.confirmButton}
              title="Подтвердить"
              onPress={handleConfirmCrop}
            />
            <Pressable onPress={onClose} style={styles.cancelBtn} hitSlop={10}>
              <Typography variant="h2" style={{ color: colors.mainColor }}>
                Отмена
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  popoverCard: {
    width: CARD_WIDTH,
    height: 611,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  modalTitle: {
    textAlign: "center",
    width: "100%",
  },
  fixedPreviewZone: {
    width: FIX_ZONE_SIZE,
    height: FIX_ZONE_SIZE,
    justifyContent: "center", 
    alignItems: "center",     
  },
  cropperWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F2F2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sourceImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", 
  },
  formatSelector: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  formatBtnActive: {
    borderColor: colors.mainColor,
    backgroundColor: "rgba(150, 157, 255, 0.1)",
  },
  iconRect: {
    borderWidth: 2,
    borderColor: colors.mainColor,
    borderRadius: 5,
  },
  iconRectActive: {
    borderColor: colors.mainColor,
    backgroundColor: colors.mainColor,
  },
  iconRectVertical: { width: 30, height: 40 },
  iconRectHorizontal: { width: 40, height: 30 },
  actionContainer: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  confirmButton: {
    width: "100%",
  },
  cancelBtn: {
    paddingVertical: 4,
    marginBottom: 10,
  },
});
