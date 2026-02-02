import React from 'react';
import { Image, ImageStyle } from 'react-native';
import { Images } from '@/assets';

/**
 * Props для компонента Logo.
 */
interface LogoProps {
  /**
   * Размер логотипа (ширина и высота).
   *
   * @default 150
   */
  size?: number;
  /**
   * Дополнительные стили для изображения логотипа.
   * Позволяет переопределять или расширять базовые стили.
   */
  style?: ImageStyle;
}

/**
 * Компонент логотипа приложения, отображающего очень веселую звезду.
 *
 * Используется на экране знакомства с пользователем.
 * Отображает логотип с фиксированными пропорциями.
 *
 * @example
 * ```tsx
 * <Logo />
 *
 * <Logo size={200} />
 *
 * <Logo style={{ marginTop: 24 }} />
 * ```
 */
export const LogoHappyStar = ({ size = 150, style }: LogoProps) => (
  <Image
    source={Images.logoHappyStar}
    style={[{ width: size, height: size, marginBottom: 12 }, style]}
    resizeMode="contain"
  />
);
