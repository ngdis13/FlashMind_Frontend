// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import { Pressable, View, StyleSheet, StyleProp, ViewStyle } from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

/**
 * Пропсы для компонента RatingButton
 * @interface RatingButtonProps
 * @property {string} label - Текст кнопки
 * @property {StyleProp<ViewStyle>} colorStyle - Стиль цвета кнопки
 * @property {() => void} onPress - Колбэк при нажатии на кнопку
 * @property {boolean} [disabled] - Флаг блокировки кнопки
 */
interface RatingButtonProps {
  label: string;
  colorStyle: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Компонент кнопки для оценки сложности карточки
 * 
 * @component
 * @param {RatingButtonProps} props - Свойства компонента
 * @param {string} props.label - Текст кнопки
 * @param {StyleProp<ViewStyle>} props.colorStyle - Стиль цвета кнопки
 * @param {() => void} props.onPress - Колбэк при нажатии
 * @param {boolean} [props.disabled] - Флаг блокировки
 * @returns {JSX.Element} React компонент кнопки оценки
 * 
 * @description
 * Компонент отображает кнопку для оценки сложности карточки с:
 * - Анимацией нажатия (масштабирование до 0.95)
 * - Затемнением при нажатии
 * - Возможностью блокировки
 * - Мемоизацией для оптимизации производительности
 * 
 * @example
 * // Использование кнопки оценки
 * <RatingButton
 *   label="Забыл"
 *   colorStyle={styles.redButton}
 *   onPress={() => handleRate(1)}
 *   disabled={isSubmitting}
 * />
 */
export const RatingButton = React.memo<RatingButtonProps>(({
  label,
  colorStyle,
  onPress,
  disabled = false,
}: RatingButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      {({ pressed }) => (
        <View style={[styles.ratingButton, colorStyle]}>
          {/* Слой затемнения */}
          {pressed && (
            <View 
              style={[
                StyleSheet.absoluteFill, 
                { backgroundColor: "rgba(0, 0, 0, 0.15)" }
              ]} 
            />
          )}
          
          <Typography variant="h3" color={colors.darkColor}>
            {label}
          </Typography>
        </View>
      )}
    </Pressable>
  );
});

// Добавляем displayName для отладки
RatingButton.displayName = 'RatingButton';

// --------------------------- Стили ---------------------------
/**
 * Стили для компонента RatingButton
 * @constant
 */
const styles = StyleSheet.create({
  /**
   * Стиль обертки для анимации нажатия
   */
  wrapper: {
    borderRadius: 20,
  },
  /**
   * Стиль самой кнопки
   */
  ratingButton: {
    width: 86,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden", // Чтобы затемнение не вылезало за края
  },
});