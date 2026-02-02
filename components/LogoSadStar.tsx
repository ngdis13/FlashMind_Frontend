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
 * Компонент логотипа приложения, отображающего грустную звезду.
 *
 * Используется на экранах с ошибками или неудачными попытками действий.
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
export const LogoSadStar = ({ size = 150, style }: LogoProps) => (
  <Image
    source={Images.logoSadStar}
    style={[{ width: size, height: size, marginBottom: 12 }, style]}
    resizeMode="contain"
  />
);
