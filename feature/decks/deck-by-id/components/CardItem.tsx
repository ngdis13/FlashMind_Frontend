// --------------------------- React ---------------------------
import React, { useRef, useState } from "react";

// --------------------------- React Native ---------------------------
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";

// --------------------------- Gestures / Reanimated ---------------------------
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

// --------------------------- Стили / компоненты ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import DeleteIconTrash from "@/assets/icons/DeleteIconTrash.png";
import { CustomAlert } from "@/components/CustomAlert";
import { LogoSadStar } from "@/components/LogoSadStar";

interface CardItemProps {
  id: string;
  title: string;
  deckId?: string;
  difficulty?: number;
  onPress?: (id: string, deckId?: string) => void;
  onDelete?: (id: string, deckId?: string) => void;
  style?: StyleProp<ViewStyle>;
}

// Ширина красной кнопки удаления, «прячущейся» под карточкой
const SWIPE_DELETE_WIDTH = 72;

/**
 * Цвет рамки по сложности (v2.0.0: difficulty — число FSRS)
 */
const getBorderColor = (diff: number | null | undefined): string => {
  if (diff === null || diff === undefined) return "#DBDBDB";
  if (diff <= 3) return "#7EE083";
  if (diff <= 8) return "#FFC39B";
  return "#FB8B93";
};

/**
 * Красная кнопка удаления: выезжает справа по мере свайпа (как в iOS).
 * Анимация на Reanimated — интерполяция progress свайпа в translateX.
 */
const RightDeleteAction: React.FC<{
  progress: SharedValue<number>;
  onPress: () => void;
}> = ({ progress, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [SWIPE_DELETE_WIDTH, 0],
        ),
      },
    ],
  }));

  return (
    <Reanimated.View style={[styles.actionBox, animatedStyle]}>
      <Pressable onPress={onPress} style={styles.deleteCircle} hitSlop={4}>
        <Image
          source={DeleteIconTrash}
          style={styles.deleteIcon}
          resizeMode="contain"
        />
      </Pressable>
    </Reanimated.View>
  );
};

export const CardItem = ({
  id,
  title,
  deckId,
  difficulty,
  onPress,
  onDelete,
  style,
}: CardItemProps) => {
  // Поп-ап подтверждения удаления
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const swipeableRef =
    useRef<React.ComponentRef<typeof ReanimatedSwipeable>>(null);

  const handlePress = (): void => {
    onPress?.(id, deckId);
  };

  // Тап по красной кнопке: закрываем свайп и открываем подтверждение
  const handleSwipeDeletePress = (): void => {
    swipeableRef.current?.close();
    setIsDeleteAlertVisible(true);
  };

  const handleConfirmDelete = (): void => {
    setIsDeleteAlertVisible(false);
    onDelete?.(id, deckId);
  };

  const handleCancelDelete = (): void => {
    setIsDeleteAlertVisible(false);
  };

  return (
    <View>
      <ReanimatedSwipeable
        ref={swipeableRef}
        containerStyle={[styles.swipeContainer, style]}
        renderRightActions={(progress) => (
          <RightDeleteAction
            progress={progress}
            onPress={handleSwipeDeletePress}
          />
        )}
        rightThreshold={40}
        friction={2}
        overshootRight={false}
        enableTrackpadTwoFingerGesture
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={[styles.card, { borderColor: getBorderColor(difficulty) }]}
        >
          <View style={styles.textContainer}>
            <Typography variant="h2" numberOfLines={2} style={{ lineHeight: 20 }}>
              {title}
            </Typography>
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>

      <CustomAlert
        visible={isDeleteAlertVisible}
        message="Ты действительно хочешь удалить карточку?"
        confirmText="Удалить"
        cancelText="Вернуться к карточкам"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        icon={<LogoSadStar size={128} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    width: "100%",
  },
  actionBox: {
    width: SWIPE_DELETE_WIDTH,
    height: "100%",
    paddingLeft: 4, // зазор между карточкой и кнопкой
  },
  deleteCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 20, 
    backgroundColor: colors.errorColor,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 10, // 12 → 10: компенсация рамки, итог ровно 64
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    width: "100%",
    minHeight: 64, // 2×20 (текст) + 10×2 (padding) + 2×2 (рамка) = 64, как в Figma
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
});
