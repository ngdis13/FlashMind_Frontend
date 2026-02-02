import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

/**
 * Props для компонента SecondButton.
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
}

/**
 * Вторая основная кнопка приложения.
 *
 * Используется для действий, которые не являются главными,
 * но все равно важны для пользователя (например, регистрация, сохранение, отмена).
 * Визуально кнопка отличается от основной кнопки, имеет рамку и другой цвет текста.
 *
 * Пример использования:
 * ```tsx
 * <SecondButton
 *   title="Зарегистрироваться"
 *   onPress={handleRegister}
 * />
 * ```
 *
 * **Отличия от основной кнопки**:
 * - Основной цвет текста: #6E75D9
 * - Фон: белый
 * - Рамка: #6E75D9
 *
 * Это помогает пользователю различать ключевые действия от второстепенных.
 */
export const SecondButton = ({ title, onPress }: ButtonProps) => (
  <TouchableOpacity style={styles.btn} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderColor: '#6E75D9',
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    width: '100%',
    height: 46,
    maxWidth: 400,
  },
  text: {
    color: '#6E75D9',
    fontSize: 16,
    fontFamily: 'MontserratSemibold',
    fontWeight: '400',
  },
});
