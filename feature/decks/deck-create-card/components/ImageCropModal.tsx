// feature-decks/deck-create-card/components/ImageCropModal.tsx
import React, { useState } from "react";
import { Modal, View, StyleSheet, Pressable, Image } from "react-native";
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

// Фиксированные размеры твоей карточки из стилей
const CARD_WIDTH = 373;
const CROPPER_SIZE = 300; // Оптимальный размер холста, чтобы всё уместилось внутри 611px высоты

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

  // Рассчитываем точные пропорции рамки маски (3:4 или 4:3) строго внутри холста 300x300
  const cropFrameSize =
    aspectRatio === "vertical"
      ? { width: CROPPER_SIZE * 0.75, height: CROPPER_SIZE } // Вертикальный прямоугольник (225x300)
      : { width: CROPPER_SIZE, height: CROPPER_SIZE * 0.75 }; // Горизонтальный прямоугольник (300x225)

  const handleConfirmCrop = async () => {
    if (!imageUri || !origWidth || !origHeight) return;

    try {
      // 1. Вычисляем целевые пропорции (3:4 для вертикального, 4:3 для горизонтального)
      const targetRatio = aspectRatio === "vertical" ? 3 / 4 : 4 / 3;

      let cropWidth = origWidth;
      let cropHeight = origHeight;

      // 2. Рассчитываем рамку среза (кадрирование БЕЗ искажения пропорций)
      if (origWidth / origHeight > targetRatio) {
        // Если картинка шире — фиксируем высоту, срезаем лишнее по бокам
        cropWidth = origHeight * targetRatio;
      } else {
        // Если картинка выше — фиксируем ширину, срезаем лишнее сверху/снизу
        cropHeight = origWidth / targetRatio;
      }

      cropWidth = Math.floor(cropWidth);
      cropHeight = Math.floor(cropHeight);

      // Находим координаты центра для симметричного кадрирования
      let originX = Math.floor((origWidth - cropWidth) / 2);
      let originY = Math.floor((origHeight - cropHeight) / 2);

      originX = Math.max(0, Math.min(originX, origWidth - cropWidth));
      originY = Math.max(0, Math.min(originY, origHeight - cropHeight));

      // 3. Формируем цепочку действий с премиум-качеством
      const actions = [
        {
          // ПЕРВЫЙ ШАГ: Отрезаем лишние края по центру (картинка не деформируется)
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

      // 4. Запускаем обработку со 100% качеством без сжатия в формате PNG
      const result = await ImageManipulator.manipulateAsync(imageUri, actions, {
        compress: 1.0, // 100% сохранение качества, максимум из возможного
        format: ImageManipulator.SaveFormat.PNG, // PNG сохраняет пиксели без потерь
      });

      // Возвращаем готовую, кристально чистую картинку высокого разрешения
      onConfirm(result.uri);
    } catch (error) {
      console.error(
        "Ошибка при выполнении манипуляции кропа и ресайза:",
        error,
      );
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
          <Typography variant="h2" style={styles.modalTitle}>
            Выберите, как будет выглядеть ваша картинка
          </Typography>

          {/* Контейнер отображения фотографии с центрированием */}
          <View style={styles.cropperWrapper}>
            <Image source={{ uri: imageUri }} style={styles.sourceImage} />
            <View
              style={[
                styles.cropFrame,
                { width: cropFrameSize.width, height: cropFrameSize.height },
                aspectRatio === "horizontal" && styles.cropFrameHorizontal,
              ]}
            />
          </View>

          {/* Селектор формата */}
          <View style={styles.formatSelector}>
            <Pressable
              style={[
                aspectRatio === "vertical" && styles.formatBtnActive,
              ]}
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
              style={[
                aspectRatio === "horizontal" && styles.formatBtnActive,
              ]}
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
    width: CARD_WIDTH, // Твой фиксированный размер
    height: 611, // Твой фиксированный размер
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20, // Твой оригинальный отступ
    alignItems: "center",
    justifyContent: "space-between", // Распределяет элементы сверху вниз, чтобы ничего не наезжало
  },
  modalTitle: {
    textAlign: "center",
  },
  cropperWrapper: {
    width: CROPPER_SIZE, // Фиксируем под размеры карточки
    height: CROPPER_SIZE,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  sourceImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cropFrame: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#5A67D8",
    borderRadius: 12,
    backgroundColor: "transparent",
    aspectRatio: 3 / 4,
  },
  cropFrameHorizontal: {
    aspectRatio: 4 / 3,
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
    marginBottom: 10
  },
});
