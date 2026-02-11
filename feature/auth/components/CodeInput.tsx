import React, { useState, useRef } from 'react';
import { Pressable, TextInput, View, StyleSheet } from 'react-native';
import { Typography } from '@/styles/Typography';

type CodeInputProps = {
  length?: number;
  onCodeFilled?: (code: string) => void;
};

/**
 * Компонент для ввода одноразового кода подтверждения (OTP).
 * 
 * Отображает заданное количество ячеек для ввода цифр.
 * Ввод осуществляется через скрытый TextInput, а символы
 * визуально отображаются в отдельных блоках.
 * 
 * После того как пользователь вводит полный код (длина равна `length`),
 * вызывается callback `onCodeFilled`.
 *
 * @component
 * @param {number} [length=6] - Количество символов (цифр) в коде.
 * @param {(code: string) => void} [onCodeFilled] - Функция, вызываемая при полном вводе кода.
 * 
 * @returns {JSX.Element} Компонент ввода кода подтверждения.
 */
export const CodeInput = ({
  length = 6,
  onCodeFilled,
}: CodeInputProps) => {
  // ---------------------------
  // Состояние введенного кода
  const [code, setCode] = useState('');

  // Ссылка на скрытый TextInput для управления фокусом
  const inputRef = useRef<TextInput>(null);

  /**
   * Обрабатывает изменение значения в TextInput.
   * 
   * - Удаляет все символы, кроме цифр.
   * - Ограничивает длину кода значением `length`.
   * - При достижении полной длины вызывает `onCodeFilled`.
   * 
   * @param {string} value - Введенное пользователем значение
   */
  const handleChange = (value: string) => {
    const sanitazed = value.replace(/[^0-9]/g, '').slice(0, length);
    setCode(sanitazed);

    if (sanitazed.length === length && onCodeFilled) {
      onCodeFilled(sanitazed);
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => inputRef.current?.focus()}
    >
      {/* Скрытое поле ввода для обработки клавиатуры */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        autoFocus
      />

      {/* Визуальные ячейки для отображения кода */}
      {Array.from({ length }).map((_, i) => {
        const char = code[i] ?? '';
        const isActive = i === code.length;

        return (
          <View
            key={i}
            style={[styles.box, isActive && styles.activeBox]}
          >
            <Typography variant="h2">{char}</Typography>
          </View>
        );
      })}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // ---------------------------
  // Контейнер для ячеек кода
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },

  // Скрытый input (не отображается, используется только для ввода)
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },

  // Обычная ячейка
  box: {
    width: 46,
    height: 46,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },

  // Активная ячейка (куда вводится следующий символ)
  activeBox: {
    borderColor: '#6E75D9',
  },

  // (Не используется, но оставлен для возможного кастомного текста)
  char: {
    fontSize: 22,
    fontWeight: '600',
  },
});
