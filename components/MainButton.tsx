import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
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
  textColor?: string;
  /**
   * Необязательный пропс для передачи иконки или картинки (React-компонент),
   * которая отобразится слева от текста.
   */
  icon?: React.ReactNode;
}

/**
 * Основная кнопка приложения с поддержкой иконки слева.
 */
export const MainButton = ({
  title,
  onPress,
  style,
  disabled = false,
  activeColor = colors.mainColor, // Установим значение по умолчанию для основного цвета
  textColor = colors.white,
  icon,
}: ButtonProps) => {
  const buttonColor = disabled ? colors.lightMainColor : activeColor; // Если кнопка неактивна, цвет будет lightMainColor, иначе - activeColor

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: buttonColor }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={styles.contentContainer}>
        {/* Рендерим иконку только если она передана */}
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center', // Центрируем контент по вертикали
    width: '100%',
    height: 46,
  },
  contentContainer: {
    flexDirection: 'row',     // Выстраиваем иконку и текст в ряд
    alignItems: 'center',     // Центрируем иконку и текст по одной оси
    justifyContent: 'center', // Центрируем всю группу внутри кнопки
  },
  iconWrapper: {
    marginRight: 8,           // Отступ между иконкой и текстом
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'MontserratSemibold',
    fontWeight: '400',
  },
});
