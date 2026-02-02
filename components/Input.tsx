import React from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  TextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';

/**
 * Props для компонента Input.
 * Расширяет стандартные TextInputProps React Native.
 */
interface InputProps extends TextInputProps {
  /**
   * Текстовая метка, отображаемая над инпутом.
   * Если не передана — label не рендерится.
   */
  label?: string;

  /**
   * Дополнительные стили для TextInput.
   * Позволяет переопределять или расширять базовые стили.
   */
  style?: StyleProp<TextStyle>;
}

/**
 * Универсальный текстовый инпут с опциональным label.
 *
 * Используется для ввода текста, email, паролей и других данных.
 * Поддерживает все стандартные свойства TextInput.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Введите email"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 * ```
 */
export const Input = ({ label, style, ...props }: InputProps) => {
  return (
    <>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#999"
        {...props}
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontSize: 16,
    color: '#585858',
    fontFamily: 'MontserratSemibold',
    fontWeight: '400',
  },
  input: {
    borderWidth: 2,
    borderColor: '#DBDBDB',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'MontserratSemibold',
    color: '#000',
    textAlign: 'center',
    height: 40,
    width: '100%',

    // --- тень под инпутом (имитация глубины) ---
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // для Android
  },
});
