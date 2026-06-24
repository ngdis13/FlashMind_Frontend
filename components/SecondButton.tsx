import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
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
   * Обработчик нажатия на кнопку.
   */
  onPress: () => void;
  /**
   * Необязательный пропс для передачи иконки или картинки (React-компонент),
   * которая отобразится слева от текста.
   */
  icon?: React.ReactNode;
}

/**
 * Вторая основная кнопка приложения с поддержкой иконки слева.
 */
export const SecondButton = ({ title, onPress, style, icon }: ButtonProps) => (
  <TouchableOpacity style={[styles.btn, style]} onPress={onPress}>
    <View style={styles.contentContainer}>
      {/* Рендерим иконку только если она передана */}
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={styles.text}>{title}</Text>
    </View>
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
    color: '#6E75D9',
    fontSize: 16,
    fontFamily: 'MontserratSemibold',
    fontWeight: '400',
  },
});
