import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '@/styles/Colors';

/**
 * Props для компонента MainButton.
 */
interface ButtonProps {
  /**
   * Текст, отображаемый на кнопке.
   */
  title: string;
  /**
   * Дополнительные стили для контейнера кнопки.
   * Позволяет переопределять или расширять базовые стили.
   */
  style?: ViewStyle | ViewStyle[];
  /**
   * Обработчик нажатия на кнопку
   */
  onPress: () => void;
  /**
   * Отключает кнопку.
   * В состоянии disabled кнопка меняет цвет и не реагирует на нажатия.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Цвет кнопки в активном состоянии.
   *
   * @default colors.mainColor
   */
  activeColor?: string; // Новый пропс для активного цвета
}

/**
 * Основная кнопка приложения.
 *
 * Используется для ключевых действий пользователя
 * (вход, подтверждение, сохранение и т.д.).
 *
 * Автоматически изменяет внешний вид при отключении (`disabled`).
 *
 * @example
 * ```tsx
 * <MainButton
 *   title="Войти"
 *   onPress={handleLogin}
 * />
 *
 * <MainButton
 *   title="Сохранить"
 *   activeColor="#4CAF50"
 *   onPress={handleSave}
 * />
 *
 * <MainButton
 *   title="Отправить"
 *   disabled
 *   onPress={handleSubmit}
 * />
 * ```
 */
export const MainButton = ({
  title,
  onPress,
  style,
  disabled = false,
  activeColor = colors.mainColor, // Установим значение по умолчанию для основного цвета
}: ButtonProps) => {
  const buttonColor = disabled ? colors.lightMainColor : activeColor; // Если кнопка неактивна, цвет будет lightMainColor, иначе - activeColor

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: buttonColor }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    height: 46,
    maxWidth: 400,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'MontserratSemibold',
    fontWeight: '400',
  },
});
