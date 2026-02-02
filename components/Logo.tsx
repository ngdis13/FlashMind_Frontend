import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
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
  style?: StyleProp<ImageStyle>;
}

/**
 * Компонент логотипа приложения.
 *
 * Используется на экранах авторизации, загрузки и приветственных экранах.
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
export const Logo = ({ size = 150, style }: LogoProps) => (
  <Image
    source={Images.logo}
    style={[{ width: size, height: size, marginBottom: 12 }, style]}
    resizeMode="contain"
  />
);
