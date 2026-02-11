import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import { Typography } from '@/styles/Typography';
import { colors } from '@/styles/Colors';

/**
 * Пропсы компонента выбора минут.
 *
 * @interface MinutesSelectionFieldProps
 * @property {number} [initialValue=20] - Начальное значение поля в минутах.
 * @property {number} [min=5] - Минимально допустимое значение.
 * @property {number} [max=1440] - Максимально допустимое значение.
 * @property {(value: number) => void} [onChange] - Колбэк, вызываемый при изменении значения.
 */
interface MinutesSelectionFieldProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

/**
 * Компонент выбора времени в минутах с кнопками "+" и "−" и возможностью ввода вручную.
 *
 * Особенности:
 * - Ограничивает значения между `min` и `max`.
 * - Кнопки увеличивают/уменьшают значение на 5 минут.
 * - Можно кликнуть по числу, чтобы открыть фокус для ручного ввода.
 * - Подсветка текста при фокусе.
 *
 * @example
 * ```tsx
 * <MinutesSelectionField
 *   initialValue={30}
 *   min={5}
 *   max={120}
 *   onChange={(value) => console.log("Выбрано минут:", value)}
 * />
 * ```
 *
 * @param {MinutesSelectionFieldProps} props - Пропсы компонента
 * @returns {JSX.Element} Поле выбора минут
 */
export const MinutesSelectionField = ({
  initialValue = 20,
  min = 5,
  max = 1440,
  onChange,
}: MinutesSelectionFieldProps) => {
  const [value, setValue] = useState(initialValue.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  /**
   * Возвращает числовое значение поля.
   * Если текущее значение некорректное, возвращает initialValue.
   */
  const getNumericValue = () => {
    const num = Number(value);
    return isNaN(num) ? initialValue : num;
  };

  /**
   * Применяет новое значение с учётом ограничений min/max и вызывает onChange.
   * @param {number} newValue - Новое значение для установки
   */
  const applyValue = (newValue: number) => {
    const clamped = Math.min(Math.max(newValue, min), max);
    setValue(clamped.toString());
    onChange?.(clamped);
  };

  /** Снимает фокус с поля ввода */
  const blurInput = () => {
    inputRef.current?.blur();
  };

  /** Уменьшает значение на 5 минут */
  const handleMinus = () => {
    blurInput();
    applyValue(getNumericValue() - 5);
  };

  /** Увеличивает значение на 5 минут */
  const handlePlus = () => {
    blurInput();
    applyValue(getNumericValue() + 5);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.control} onPress={handleMinus}>
        <Typography variant="h1">−</Typography>
      </TouchableOpacity>

      <Pressable
        style={styles.minutes}
        onPress={() => inputRef.current?.focus()}
      >
        <Typography
          variant="h1"
          style={[
            styles.valueText,
            isFocused && styles.valueTextFocused,
          ]}
        >
          {value || min}
        </Typography>
      </Pressable>

      <TouchableOpacity style={styles.control} onPress={handlePlus}>
        <Typography variant="h1">+</Typography>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: colors.mainColor,
    borderWidth: 2,

    height: 56,
    width: '100%',
    maxWidth: 375,
    paddingHorizontal: 10,
  },

  control: {
    width: 33,
    height: 33,
    borderRadius: 20,
    backgroundColor: colors.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  minutes: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 300,
  },

  valueText: {
    color: '#9A9A9A',
  },

  valueTextFocused: {
    color: '#4A4A4A',
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
});
