import React, { ReactNode } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Typography } from '@/styles/Typography';

/**
 * Пропсы компонента SelectionField.
 *
 * @interface SelectionProps
 * @property {ReactNode} image - Иконка или элемент изображения для отображения слева от текста.
 * @property {string} title - Заголовок или текст кнопки.
 * @property {ViewStyle | ViewStyle[]} [style] - Дополнительные стили для контейнера.
 * @property {() => void} onPress - Функция-обработчик нажатия.
 */
interface SelectionProps {
  image: ReactNode;
  title: string;
  style?: ViewStyle | ViewStyle[];
  onPress: () => void;
}

/**
 * Компонент выбора (Selection Field) с иконкой и текстом.
 *
 * Используется для отображения интерактивного поля выбора с иконкой и заголовком.
 * Поддерживает кастомное событие нажатия.
 *
 * @example
 * ```tsx
 * <SelectionField
 *   image={<Icon name="star" size={24} color="#FFD700" />}
 *   title="Выбрать звезду"
 *   onPress={() => console.log("Поле выбрано")}
 * />
 * ```
 *
 * @param {SelectionProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент поля выбора
 */
export const SelectionField = ({
  image,
  title,
  onPress,
}: SelectionProps) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
    <View>{image}</View>
    <Typography variant="h2">{title}</Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 375,
    height: 58,
    paddingHorizontal: 16,
  },
});
